// app/api/dashboard/forecast-stock/route.js
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
        CAST(p.stok AS UNSIGNED) AS current_stock,
        p.satuan,
        COALESCE(SUM(dt.jumlahBarang), 0) AS total_sold
      FROM products p
      LEFT JOIN detailtransaksi dt ON p.id = dt.barangId
      LEFT JOIN transaksi t ON dt.transaksiId = t.id
      WHERE t.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.id, p.name, p.stok, p.satuan
      HAVING current_stock > 0
      ORDER BY total_sold DESC, current_stock ASC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return NextResponse.json({
        name: "Semua stok aman",
        currentStock: 0,
        dailySales: 0,
        daysLeft: 999,
        risk: "low",
        satuan: ""
      });
    }

    const product = rows[0];
    const dailySales = Number(product.total_sold) / 30 || 0.1;
    const daysLeft = Number(product.current_stock) / dailySales;

    let risk = "low";
    if (daysLeft <= 1) risk = "critical";
    else if (daysLeft <= 3) risk = "high";
    else if (daysLeft <= 7) risk = "medium";

    return NextResponse.json({
      name: product.name,
      currentStock: Number(product.current_stock),
      dailySales: Math.round(dailySales * 10) / 10,
      daysLeft: daysLeft,
      risk: risk,
      satuan: product.satuan || "unit",
    });
  } catch (error) {
    console.error("Forecast error:", error);
    return NextResponse.json(
      { error: "Gagal ambil data" },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}