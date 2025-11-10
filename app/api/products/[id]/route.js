import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// === GET: Ambil 1 Produk ===
export async function GET(request, { params }) {
  let db;
  try {
    const { id } = await params;
    
    db = await getConnection();
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

// === PUT: Update Produk ===
export async function PUT(request, { params }) {
  let db = null;
  let actorId = null;

  try {
    const { id } = await params;
    const body = await request.json();
    const { stok, deskrip, harga, stok_maksimal } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    const [old] = await db.query("SELECT name, stok, harga FROM products WHERE id = ?", [id]);
    if (old.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.query(
      `UPDATE products SET stok = ?, deskrip = ?, harga = ?, stok_maksimal = ? WHERE id = ?`,
      [stok, deskrip || null, harga, stok_maksimal, id]
    );

    // Log perubahan yang terjadi
    const changes = [];
    if (old[0].stok !== stok) changes.push(`stok ${old[0].stok} → ${stok}`);
    if (old[0].harga !== harga) changes.push(`harga Rp${old[0].harga} → Rp${harga}`);
    
    if (changes.length > 0) {
      await logActivity(db, `Edit produk: ${old[0].name} (${changes.join(', ')})`, actorId);
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

export async function DELETE(request, { params }) {
  let db = null;
  let actorId = null;

  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    const [product] = await db.query("SELECT name, stok, satuan FROM products WHERE id = ?", [id]);
    if (product.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.query("DELETE FROM products WHERE id = ?", [id]);

    await logActivity(db, `Hapus produk: ${product[0].name} (stok: ${product[0].stok} ${product[0].satuan})`, actorId);

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}