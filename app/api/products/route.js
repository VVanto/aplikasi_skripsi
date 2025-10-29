import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  let db = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10;

    // Ambil koneksi dari pool
    db = await getConnection();

    // Query untuk menghitung total produk
    let countSql = "SELECT COUNT(*) as total FROM products";
    let countParams = [];
    if (q) {
      countSql += " WHERE name LIKE ?";
      countParams.push(`%${q}%`);
    }
    const [countResult] = await db.query(countSql, countParams);
    const totalCount = countResult[0].total;

    // Query untuk mengambil produk dengan pagination
    let sql = "SELECT * FROM products";
    let params = [];
    if (q) {
      sql += " WHERE name LIKE ?";
      params.push(`%${q}%`);
    }
    sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const [products] = await db.query(sql, params);

    return NextResponse.json({ products, count: totalCount });

  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { products: [], count: 0, error: error.message },
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
    const { name, kate, desc, harga, stok, satuan } = body;

    // Validasi input
    if (!name || !kate || !harga || !stok || !satuan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi kecuali deskripsi" },
        { status: 400 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    // Insert produk baru
    const sql = `
      INSERT INTO products (name, kate, deskrip, harga, stok, satuan, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(sql, [
      name,
      kate,
      desc || null,
      harga,
      stok,
      satuan,
    ]);

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan", id: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Products POST error:", error);
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