// file: app/api/products/route.js

import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ITEMS_PER_PAGE = 10;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  // INI BARU: Kalau ada parameter ?all=true atau ?limit=... maka bypass pagination
  const all = searchParams.get("all") === "true";
  const limitParam = searchParams.get("limit");
  const isFullLoad = all || (limitParam && parseInt(limitParam) > ITEMS_PER_PAGE);

  let db;
  try {
    db = await getConnection();

    const conditions = [];
    const params = [];

    if (q) {
      conditions.push("(name LIKE ? OR kate LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      conditions.push("kate = ?");
      params.push(category);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Hitung total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products ${where}`,
      params
    );
    const total = countResult[0].total;

    let products = [];
    let finalLimit, finalOffset;

    if (isFullLoad) {
      // MODE FULL: Ambil semua atau sesuai limit yang diminta
      finalLimit = limitParam ? Math.min(parseInt(limitParam), 100000) : 100000;
      finalOffset = 0;
    } else {
      // MODE PAGINATION biasa
      finalLimit = ITEMS_PER_PAGE;
      finalOffset = (page - 1) * ITEMS_PER_PAGE;
    }

    const [rows] = await db.query(
      `SELECT id, name, kate, harga, stok, satuan, gambar 
       FROM products ${where} 
       ORDER BY name ASC 
       LIMIT ? OFFSET ?`,
      [...params, finalLimit, finalOffset]
    );

    products = rows;

    return NextResponse.json({
      products,
      count: total,
      page: isFullLoad ? 1 : page,
      limit: finalLimit,
      totalPages: isFullLoad ? 1 : Math.ceil(total / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json(
      { products: [], count: 0, error: error.message },
      { status: 500 }
    );
  } finally {
    db?.release();
  }
}

// POST tetap sama seperti punya kamu (nggak perlu diubah)
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