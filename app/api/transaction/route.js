import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10; // Jumlah item per halaman

    const db = await createConnection();

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

    // Query untuk mengambil transaksi dengan JOIN, pencarian, dan pagination
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
    console.log(error);
    return NextResponse.json({ transaksi: [], count: 0, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tanggal, items } = body;

    if (!tanggal || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Tanggal dan minimal satu item harus diisi" },
        { status: 400 }
      );
    }

    // Ambil userID dari token JWT (asumsi middleware set header 'user-id' atau dari request.cookies)
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "User tidak terautentikasi" }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id; // Ambil userID dari token

    const db = await createConnection();

    // Hitung totalHarga dari items
    let totalHarga = 0;
    for (const item of items) {
      const { barangId, jumlahBarang, hargaSatuan } = item;
      if (!barangId || !jumlahBarang || !hargaSatuan) {
        return NextResponse.json({ error: "Item tidak lengkap" }, { status: 400 });
      }
      const [product] = await db.query("SELECT id, harga FROM products WHERE id = ?", [barangId]);
      if (product.length === 0) {
        return NextResponse.json({ error: `Barang ID ${barangId} tidak ditemukan` }, { status: 404 });
      }
      const subTotal = jumlahBarang * hargaSatuan;
      item.subTotal = subTotal;
      totalHarga += subTotal;
    }

    // Insert transaksi dengan userID dari token
    const sql =
      "INSERT INTO transaksi (createdAt, totalHarga, userID) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [tanggal, totalHarga, userID]);
    const transaksiId = result.insertId;

    // Insert detailtransaksi
    for (const item of items) {
      const sqlDetail = "INSERT INTO detailtransaksi (transaksiId, barangId, jumlahBarang, hargaSatuan, subTotal) VALUES (?, ?, ?, ?, ?)";
      await db.query(sqlDetail, [transaksiId, item.barangId, item.jumlahBarang, item.hargaSatuan, item.subTotal]);
    }

    return NextResponse.json(
      { message: "Transaksi berhasil ditambahkan", id: transaksiId },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}