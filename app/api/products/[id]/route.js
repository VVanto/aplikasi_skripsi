import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const db = await createConnection();
    const id = params.id;
    const sql = "SELECT * FROM products WHERE id = ?";
    const [products] = await db.query(sql, [id]);

    if (products.length === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(products[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = await createConnection();
    const id = params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, kate, deskrip, harga, stok, satuan } = body;
    const id = params.id;

    if (!name || !kate || !harga || !stok || !satuan) {
      return NextResponse.json(
        { error: "Field nama, kategori, harga, stok, dan satuan harus diisi" },
        { status: 400 }
      );
    }

    const db = await createConnection();

    const sql =
      "UPDATE products SET name = ?, kate = ?, deskrip = ?, harga = ?, stok = ?, satuan = ? WHERE id = ?";
    const [result] = await db.query(sql, [name, kate, deskrip || null, harga, stok, satuan, id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Produk berhasil diupdate" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}