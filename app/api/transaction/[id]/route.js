import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const db = await createConnection();
    const id = params.id;

    // Fetch detail transaksi utama
    const sqlTransaksi = `
      SELECT ts.id, ts.createdAt, ts.totalHarga, usr.id AS userID, usr.name, usr.username 
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

    // Fetch detailtransaksi dengan JOIN ke products untuk nama barang
    const sqlDetail = `
      SELECT dt.id, dt.jumlahBarang, dt.hargaSatuan, dt.subTotal, p.name AS namaBarang, p.kate AS kategoriBarang 
      FROM detailtransaksi dt 
      JOIN products p ON dt.barangId = p.id 
      WHERE dt.transaksiId = ?
    `;
    const [detailtransaksi] = await db.query(sqlDetail, [id]);

    return NextResponse.json({ transaksi, detailtransaksi });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE dan PUT tetap seperti sebelumnya, jika perlu
// ... (kode DELETE dan PUT dari sebelumnya)
