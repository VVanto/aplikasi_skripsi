export const dynamic = "force-dynamic";
export const revalidate = 0;

// app/api/dashboard/stats/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; 
    const [rows] = await conn.query(`
      SELECT 
        week_group AS week_num,
        COALESCE(SUM(totalharga), 0) AS total
      FROM (
        SELECT 
          totalharga,
          CASE 
            WHEN DAY(createdAt) BETWEEN 1 AND 7 THEN 1
            WHEN DAY(createdAt) BETWEEN 8 AND 14 THEN 2
            WHEN DAY(createdAt) BETWEEN 15 AND 21 THEN 3
            ELSE 4
          END AS week_group
        FROM transaksi
        WHERE YEAR(createdAt) = ? 
          AND MONTH(createdAt) = ?
      ) AS weekly_data
      GROUP BY week_group
      ORDER BY week_group ASC
    `, [currentYear, currentMonth]);

    // Pasti in semua 4 minggu ada (bahkan kalo kosong)
    const fullData = [];
    for (let i = 1; i <= 4; i++) {
      const found = rows.find(r => Number(r.week_num) === i);
      fullData.push({
        name: `Minggu ${i}`,
        total: found ? Number(found.total) : 0,
      });
    }

    return NextResponse.json({ data: fullData });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}