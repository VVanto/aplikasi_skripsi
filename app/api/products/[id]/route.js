import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  let db = null;
  
  try {
    const { id } = await params;
    
    // Ambil koneksi dari pool
    db = await getConnection();
    
    const sql = "SELECT * FROM products WHERE id = ?";
    const [products] = await db.query(sql, [id]);

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(products[0]);

  } catch (error) {
    console.error("Product GET by ID error:", error);
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

export async function DELETE(request, { params }) {
  let db = null;
  
  try {
    const { id } = await params;
    
    // Ambil koneksi dari pool
    db = await getConnection();
    
    const sql = "DELETE FROM products WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Produk berhasil dihapus" });

  } catch (error) {
    console.error("Product DELETE error:", error);
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

export async function PUT(request, { params }) {
  let db = null;
  
  try {
    const body = await request.json();
    const { name, kate, deskrip, harga, stok, satuan } = body;
    const { id } = await params;

    // Validasi input
    if (!name || !kate || !harga || !stok || !satuan) {
      return NextResponse.json(
        { error: "Field nama, kategori, harga, stok, dan satuan harus diisi" },
        { status: 400 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    const sql = `
      UPDATE products 
      SET name = ?, kate = ?, deskrip = ?, harga = ?, stok = ?, satuan = ? 
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      name,
      kate,
      deskrip || null,
      harga,
      stok,
      satuan,
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Produk berhasil diupdate" });

  } catch (error) {
    console.error("Product PUT error:", error);
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