// app/api/dashboard/low-stock/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let conn = null;
  try {
    conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        id,
        name,
        CAST(stok AS UNSIGNED) AS current_stock,
        stok_maksimal,
        satuan
      FROM products
      WHERE 
        stok_maksimal > 0
        AND CAST(stok AS UNSIGNED) <= (stok_maksimal * 0.1)
      ORDER BY CAST(stok AS UNSIGNED) ASC, (CAST(stok AS UNSIGNED) / stok_maksimal) ASC
      LIMIT 10
    `);

    const lowStock = rows.map(row => {
      const current = Number(row.current_stock);
      const max = Number(row.stok_maksimal);
      const percentage = Math.round((current / max) * 100);

      return {
        id: row.id,
        name: row.name,
        stok: current,
        satuan: row.satuan,
        maxStock: max,
        percentage: percentage,
        isZero: current === 0,
      };
    });

    return NextResponse.json({ lowStock });
  } catch (error) {
    console.error("Low stock error:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}