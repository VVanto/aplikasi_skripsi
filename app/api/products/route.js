import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;

    const db = await createConnection();

    let countSql = "SELECT COUNT(*) as total FROM products";
    let countParams = [];
    if (q) {
      countSql += " WHERE name LIKE ?";
      countParams.push(`%${q}%`);
    }
    const [countResult] = await db.query(countSql, countParams);
    const totalCount = countResult[0].total;

    let sql = "SELECT * FROM products";
    let params = [];
    if (q) {
      sql += " WHERE name LIKE ?";
      params.push(`%${q}%`);
    }
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const [products] = await db.query(sql, params);

    return NextResponse.json({ products, count: totalCount });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, kate, desc, harga, stok, satuan } = body;

    if (!name || !kate || !harga || !stok || !satuan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi kecuali deskripsi" },
        { status: 400 }
      );
    }

    const db = await createConnection();

    const sql =
      "INSERT INTO products (name, kate, deskrip, harga, stok, satuan, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    const [result] = await db.query(sql, [
      name,
      kate,
      desc || null,
      harga,
      stok,
      satuan,
      // NOW() untuk memastikan createdAt terisi jika default database tidak ada
    ]);

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}