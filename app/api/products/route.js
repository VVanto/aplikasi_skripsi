import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  let db;
  try {
    db = await getConnection();

    // Build WHERE clause dinamis
    const conditions = [];
    const params = [];

    if (q) {
      conditions.push("name LIKE ?");
      params.push(`%${q}%`);
    }

    if (category) {
      conditions.push("kate = ?");
      params.push(category);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products ${where}`,
      params
    );
    const total = countResult[0].total;

    // Get products
    const [products] = await db.query(
      `SELECT * FROM products ${where} ORDER BY createdAt DESC`,
      params
    );

    return NextResponse.json({ products, count: total });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ products: [], count: 0, error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

export async function POST(request) {
  let db = null;
  let actorId = null;

  try {
    const { name, kate, desc, harga, stok, satuan, stok_maksimal, gambar } = await request.json();

    if (!name || !kate || !harga || !stok || !satuan || !stok_maksimal) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    const [result] = await db.query(
      `INSERT INTO products 
       (name, kate, deskrip, harga, stok, satuan, stok_maksimal, gambar, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, kate, desc || null, harga, stok, satuan, stok_maksimal, gambar || null]
    );

    await logActivity(db, `Tambah produk: ${name} (${stok} ${satuan})`, actorId);

    return NextResponse.json({ message: "Sukses", id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}