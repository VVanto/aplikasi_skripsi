export const dynamic = "force-dynamic";
export const revalidate = 0;

// app/api/dashboard/monthly-sales/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    // Bulan & tahun saat ini
    const [monthRows] = await conn.query(`
      SELECT 
        COALESCE(SUM(totalharga), 0) AS total_bulan_ini
      FROM transaksi
      WHERE YEAR(createdAt) = YEAR(CURDATE())
        AND MONTH(createdAt) = MONTH(CURDATE())
    `);

    // Bulan lalu (untuk % perubahan)
    const [lastMonthRows] = await conn.query(`
      SELECT 
        COALESCE(SUM(totalharga), 0) AS total_bulan_lalu
      FROM transaksi
      WHERE YEAR(createdAt) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        AND MONTH(createdAt) = MONTH(CURDATE() - INTERVAL 1 MONTH)
    `);

    const bulanIni = Number(monthRows[0].total_bulan_ini);
    const bulanLalu = Number(lastMonthRows[0].total_bulan_lalu);

    // Hitung % perubahan
    let percentageChange = 0;
    if (bulanLalu > 0) {
      percentageChange = ((bulanIni - bulanLalu) / bulanLalu) * 100;
    } else if (bulanIni > 0) {
      percentageChange = 100; // dari 0 ke ada = +100%
    }

    return NextResponse.json({
      total: bulanIni,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
    });
  } catch (error) {
    console.error("Monthly sales error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}