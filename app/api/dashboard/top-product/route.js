// app/api/dashboard/top-product/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        p.id,
        p.name,
        p.satuan,
        COALESCE(SUM(dt.jumlahBarang), 0) AS total_terjual
      FROM products p
      LEFT JOIN detailtransaksi dt ON p.id = dt.barangId
      GROUP BY p.id, p.name, p.satuan
      ORDER BY total_terjual DESC
      LIMIT 5
    `);

    if (rows.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const items = rows.map(row => ({
      id: row.id,
      name: row.name,
      satuan: row.satuan || "unit",
      sales: Number(row.total_terjual),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Top product error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}