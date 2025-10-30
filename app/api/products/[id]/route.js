import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

// === GET: Ambil 1 Produk ===
export async function GET(request, { params }) {
  const { id } = params;
  let db;
  try {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { stok, deskrip, harga, stok_maksimal } = body;

  // Validasi
  if (stok === undefined || stok < 0) {
    return NextResponse.json({ error: "Stok tidak valid" }, { status: 400 });
  }
  if (harga === undefined || harga < 0) {
    return NextResponse.json({ error: "Harga tidak valid" }, { status: 400 });
  }
  if (!stok_maksimal || stok_maksimal <= 0) {
    return NextResponse.json(
      { error: "Stok maksimal harus > 0" },
      { status: 400 }
    );
  }

  let db;
  try {
    db = await getConnection();
    const [result] = await db.query(
      `UPDATE products 
       SET stok = ?, deskrip = ?, harga = ?, stok_maksimal = ? 
       WHERE id = ?`,
      [stok, deskrip || null, harga, stok_maksimal, id]
    );

    return result.affectedRows
      ? NextResponse.json({ message: "Updated" })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}

// === DELETE: Hapus Produk ===
export async function DELETE(request, { params }) {
  const { id } = params;
  let db;
  try {
    db = await getConnection();
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows
      ? NextResponse.json({ message: "Deleted" })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    db?.release();
  }
}
