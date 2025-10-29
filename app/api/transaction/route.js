import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  let db = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;

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
  
  try {
    const body = await request.json();
    const { tanggal, items } = body;

    // Validasi input
    if (!tanggal || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Tanggal dan minimal satu item harus diisi" },
        { status: 400 }
      );
    }

    // Ambil token dari cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Verifikasi JWT
    let userID;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userID = payload.id;
    } catch (err) {
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 401 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    // Mulai transaksi database
    await db.beginTransaction();

    try {
      // Validasi & hitung total
      let totalHarga = 0;
      for (const item of items) {
        const { barangId, jumlahBarang, hargaSatuan } = item;
        
        if (!barangId || !jumlahBarang || !hargaSatuan) {
          throw new Error("Item tidak lengkap");
        }

        // Cek apakah produk ada
        const [product] = await db.query(
          "SELECT id, harga, stok FROM products WHERE id = ?",
          [barangId]
        );
        
        if (product.length === 0) {
          throw new Error(`Barang ID ${barangId} tidak ditemukan`);
        }

        // Cek stok
        if (product[0].stok < jumlahBarang) {
          throw new Error(`Stok barang ${barangId} tidak mencukupi`);
        }

        const subTotal = jumlahBarang * hargaSatuan;
        item.subTotal = subTotal;
        totalHarga += subTotal;
      }

      // Insert transaksi
      const [result] = await db.query(
        "INSERT INTO transaksi (createdAt, totalHarga, userID) VALUES (?, ?, ?)",
        [tanggal, totalHarga, userID]
      );
      const transaksiId = result.insertId;

      // Insert detail transaksi & update stok
      for (const item of items) {
        // Insert detail
        await db.query(
          `INSERT INTO detailtransaksi 
           (transaksiId, barangId, jumlahBarang, hargaSatuan, subTotal) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            transaksiId,
            item.barangId,
            item.jumlahBarang,
            item.hargaSatuan,
            item.subTotal,
          ]
        );

        // Update stok produk
        await db.query(
          "UPDATE products SET stok = stok - ? WHERE id = ?",
          [item.jumlahBarang, item.barangId]
        );
      }

      // Commit transaksi
      await db.commit();

      return NextResponse.json(
        { message: "Transaksi berhasil", id: transaksiId },
        { status: 201 }
      );

    } catch (error) {
      // Rollback jika ada error
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Transaksi POST error:", error);
    return NextResponse.json(
      { error: error.message },
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