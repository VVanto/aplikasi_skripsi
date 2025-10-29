// app/api/dashboard/top-product/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

 
    const [rows] = await conn.query(`
      SELECT 
        p.name AS nama_produk,
        SUM(dt.jumlahBarang) AS total_terjual
      FROM detailtransaksi dt
      JOIN products p ON dt.barangId = p.id
      GROUP BY dt.barangId, p.name
      ORDER BY total_terjual DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return NextResponse.json({ name: "Belum ada", sales: 0 });
    }

    const top = rows[0];
    return NextResponse.json({
      name: top.nama_produk,
      sales: Number(top.total_terjual),
    });
  } catch (error) {
    console.error("Top product error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release(); 
  }
}