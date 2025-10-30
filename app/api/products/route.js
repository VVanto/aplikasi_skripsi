// app/api/products/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 5;

// === GET: List + Search + Pagination ===
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  let db;
  try {
    db = await getConnection();

    const where = q ? "WHERE name LIKE ?" : "";
    const params = q ? [`%${q}%`] : [];

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM products ${where}`, params);
    const total = countResult[0].total;

    const [products] = await db.query(
      `SELECT * FROM products ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...params, ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE]
    );

    return NextResponse.json({ products, count: total });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ products: [], count: 0, error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

// === POST: Tambah Produk ===
export async function POST(request) {
  let db;
  try {
    const { name, kate, desc, harga, stok, satuan, stok_maksimal } = await request.json();

    if (!name || !kate || !harga || !stok || !satuan || !stok_maksimal) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    db = await getConnection();

    const [result] = await db.query(
      `INSERT INTO products 
       (name, kate, deskrip, harga, stok, satuan, stok_maksimal, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, kate, desc || null, harga, stok, satuan, stok_maksimal]
    );

    return NextResponse.json({ message: "Sukses", id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}