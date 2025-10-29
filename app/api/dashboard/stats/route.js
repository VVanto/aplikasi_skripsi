// app/api/dashboard/stats/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%d %b %Y %H:%i') AS label,
        totalharga AS total
      FROM transaksi
      ORDER BY createdAt ASC  -- LAMA → BARU
      LIMIT 50
    `);

    const data = rows.map(row => ({
      name: row.label,
      total: Number(row.total),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}