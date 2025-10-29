import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  let db = null;
  
  try {
    const { id } = await params;
    
    // Ambil koneksi dari pool
    db = await getConnection(); 

    // Fetch detail transaksi utama dengan JOIN ke users
    const sqlTransaksi = `
      SELECT 
        ts.id, 
        ts.createdAt, 
        ts.totalHarga, 
        usr.id AS userID, 
        usr.name, 
        usr.username 
      FROM transaksi ts 
      JOIN users usr ON ts.userID = usr.id 
      WHERE ts.id = ?
    `;
    const [transaksiData] = await db.query(sqlTransaksi, [id]);

    if (transaksiData.length === 0) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    const transaksi = transaksiData[0];

    // Fetch detail transaksi dengan JOIN ke products
    const sqlDetail = `
      SELECT 
        dt.id, 
        dt.barangId,
        dt.jumlahBarang, 
        dt.hargaSatuan, 
        dt.subTotal, 
        p.name AS namaBarang, 
        p.kate AS kategoriBarang 
      FROM detailtransaksi dt 
      JOIN products p ON dt.barangId = p.id 
      WHERE dt.transaksiId = ?
    `;
    const [detailtransaksi] = await db.query(sqlDetail, [id]);

    return NextResponse.json({ transaksi, detailtransaksi });

  } catch (error) {
    console.error("Transaksi GET by ID error:", error);
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

    // Mulai transaksi database
    await db.beginTransaction();

    try {
      // Ambil detail transaksi untuk mengembalikan stok
      const [details] = await db.query(
        "SELECT barangId, jumlahBarang FROM detailtransaksi WHERE transaksiId = ?",
        [id]
      );

      // Kembalikan stok produk
      for (const detail of details) {
        await db.query(
          "UPDATE products SET stok = stok + ? WHERE id = ?",
          [detail.jumlahBarang, detail.barangId]
        );
      }

      // Hapus detail transaksi
      await db.query("DELETE FROM detailtransaksi WHERE transaksiId = ?", [id]);

      // Hapus transaksi
      const [result] = await db.query("DELETE FROM transaksi WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        throw new Error("Transaksi tidak ditemukan");
      }

      // Commit transaksi
      await db.commit();

      return NextResponse.json({
        message: "Transaksi berhasil dihapus dan stok dikembalikan",
      });

    } catch (error) {
      // Rollback jika ada error
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Transaksi DELETE error:", error);
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