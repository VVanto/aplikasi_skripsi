// ✏️ UPDATED: app/api/transaksi/[id]/route.js
// Perubahan:
// - Tambah import yang hilang
// - Tambah logging di DELETE
// - Fix await params

import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request, { params }) {
  let db = null;

  try {
    const { id } = await params;

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
    p.id AS barangId,         
    dt.id AS detailId,        
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
  let actorId = null;

  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    // Mulai transaksi database
    await db.beginTransaction();

    try {
      // Ambil info transaksi untuk log
      const [transaksiInfo] = await db.query(
        "SELECT totalHarga FROM transaksi WHERE id = ?",
        [id]
      );

      if (transaksiInfo.length === 0) {
        throw new Error("Transaksi tidak ditemukan");
      }

      // Ambil detail transaksi untuk mengembalikan stok dan log
      const [details] = await db.query(
        `SELECT dt.barangId, dt.jumlahBarang, p.name 
         FROM detailtransaksi dt
         JOIN products p ON dt.barangId = p.id
         WHERE dt.transaksiId = ?`,
        [id]
      );

      const itemNames = details.map(d => `${d.name} (${d.jumlahBarang})`).join(', ');

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
      await db.query("DELETE FROM transaksi WHERE id = ?", [id]);

      // Log aktivitas
      await logActivity(
        db,
        `Hapus transaksi #${id}: Rp${transaksiInfo[0].totalHarga.toLocaleString()} - ${itemNames}`,
        actorId
      );

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