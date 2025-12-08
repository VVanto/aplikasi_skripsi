import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logActivity } from "@/app/lib/activity";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  let db = null;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 100000;

    // Ambil koneksi dari pool
    db = await getConnection();

    // Query untuk menghitung total transaksi
    let countSql = `
      SELECT COUNT(*) as total 
      FROM transaksi ts 
      JOIN users usr ON ts.userID = usr.id
    `;
    let countParams = [];
    if (q) {
      countSql += " WHERE usr.name LIKE ? OR usr.username LIKE ?";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    const [countResult] = await db.query(countSql, countParams);
    const totalCount = countResult[0].total;

    // Query untuk mengambil transaksi dengan JOIN dan pagination
    let sql = `
      SELECT ts.id, ts.createdAt, ts.totalHarga, usr.name, usr.username 
      FROM transaksi ts 
      JOIN users usr ON ts.userID = usr.id
    `;
    let params = [];
    if (q) {
      sql += " WHERE usr.name LIKE ? OR usr.username LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY ts.createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const [transaksi] = await db.query(sql, params);

    return NextResponse.json({ transaksi, count: totalCount });

  } catch (error) {
    console.error("Transaksi GET error:", error);
    return NextResponse.json(
      { transaksi: [], count: 0, error: error.message },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        db.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

export async function POST(request) {
  let db = null;
  let actorId = null;

  try {
    const body = await request.json();
    const { tanggal, items } = body;

    if (!tanggal || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Tanggal & item wajib" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();
    await db.beginTransaction();

    try {
      let totalHarga = 0;
      const itemLogs = [];

      for (const item of items) {
        const [p] = await db.query(
          "SELECT name, stok, satuan FROM products WHERE id = ?",
          [item.barangId]
        );
        if (p.length === 0) throw new Error(`Produk ${item.barangId} tidak ada`);
        if (p[0].stok < item.jumlahBarang) throw new Error(`Stok ${p[0].name} tidak cukup`);

        const subTotal = item.jumlahBarang * item.hargaSatuan;
        totalHarga += subTotal;
        itemLogs.push(`${p[0].name}: ${item.jumlahBarang} ${p[0].satuan}`);
      }

      const [result] = await db.query(
        "INSERT INTO transaksi (createdAt, totalHarga, userID) VALUES (?, ?, ?)",
        [tanggal, totalHarga, actorId]
      );
      const transaksiId = result.insertId;

      for (const item of items) {
        await db.query(
          `INSERT INTO detailtransaksi (transaksiId, barangId, jumlahBarang, hargaSatuan, subTotal) VALUES (?, ?, ?, ?, ?)`,
          [transaksiId, item.barangId, item.jumlahBarang, item.hargaSatuan, item.jumlahBarang * item.hargaSatuan]
        );
        await db.query("UPDATE products SET stok = stok - ? WHERE id = ?", [item.jumlahBarang, item.barangId]);
      }

      await logActivity(
        db,
        `Transaksi: Rp ${totalHarga.toLocaleString()} - ${itemLogs.join(", ")}`,
        actorId
      );

      await db.commit();
      return NextResponse.json({ message: "Sukses", id: transaksiId }, { status: 201 });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}