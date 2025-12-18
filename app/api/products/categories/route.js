import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let db;
  try {
    db = await getConnection();

    // Ambil kategori unik dari database, diurutkan alfabetis
    const [rows] = await db.query(
      `SELECT DISTINCT kate 
       FROM products 
       WHERE kate IS NOT NULL AND kate != '' 
       ORDER BY kate ASC`
    );

    // Extract kategori dari hasil query
    const categories = rows.map(row => row.kate);

    return NextResponse.json({ 
      categories,
      count: categories.length 
    });

  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json(
      { 
        categories: [], 
        count: 0, 
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    db?.release();
  }
}