import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  let db = null;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    // FIX: Default limit jadi 100000 supaya semua produk keambil
    const limit = parseInt(searchParams.get("limit")) || 100000;

    db = await getConnection();

    // Query untuk menghitung total produk
    let countSql = "SELECT COUNT(*) as total FROM products";
    let countParams = [];
    if (q) {
      countSql += " WHERE name LIKE ? OR category LIKE ?";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    const [countResult] = await db.query(countSql, countParams);
    const totalCount = countResult[0].total;

    // Query untuk mengambil produk dengan pagination
    let sql = "SELECT * FROM products";
    let params = [];
    if (q) {
      sql += " WHERE name LIKE ? OR category LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY name ASC LIMIT ? OFFSET ?";
    params.push(limit, (page - 1) * limit);

    const [products] = await db.query(sql, params);

    return NextResponse.json({ 
      products, 
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

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
    const { name, category, harga, stok, satuan } = body;

    if (!name || !category || !harga || !stok || !satuan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    db = await getConnection();

    const [result] = await db.query(
      "INSERT INTO products (name, category, harga, stok, satuan) VALUES (?, ?, ?, ?, ?)",
      [name, category, harga, stok, satuan]
    );

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