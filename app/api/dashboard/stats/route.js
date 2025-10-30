// app/api/dashboard/stats/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        CONCAT('Minggu ', week_num) AS week_label,
        COALESCE(SUM(total), 0) AS total
      FROM (
        SELECT 
          totalharga AS total,
          WEEK(createdAt, 3) - WEEK(DATE_FORMAT(createdAt, '%Y-%m-01'), 3) + 1 AS week_num
        FROM transaksi
        WHERE YEAR(createdAt) = YEAR(CURDATE())
          AND MONTH(createdAt) = MONTH(CURDATE())
      ) AS weekly_data
      GROUP BY week_num
      ORDER BY week_num ASC
    `);

    const fullData = [];
    for (let i = 1; i <= 4; i++) {
      const found = rows.find((r) => {
        const num = parseInt(r.week_label.split(" ")[1]);
        return num === i;
      });
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
