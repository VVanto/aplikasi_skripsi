// app/api/logs/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

const LIMIT = 10;

export async function GET(request) {
  let db = null;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const q = searchParams.get("q") || "";

    db = await getConnection();

    // === TOTAL COUNT ===
    let countSql = `
      SELECT COUNT(*) as total 
      FROM logaktivitas l
      LEFT JOIN users u ON l.userId = u.id
    `;
    let countParams = [];
    if (q) {
      countSql += ` WHERE l.deskrip LIKE ? OR u.name LIKE ? OR u.username LIKE ?`;
      countParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const [countRes] = await db.query(countSql, countParams);
    const total = countRes[0].total;

    let sql = `
      SELECT 
        l.id,
        l.createdAt,
        l.deskrip,
        u.name AS userName,
        u.username
      FROM logaktivitas l
      LEFT JOIN users u ON l.userId = u.id
    `;
    let params = [];
    if (q) {
      sql += ` WHERE l.deskrip LIKE ? OR u.name LIKE ? OR u.username LIKE ?`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ` ORDER BY l.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(LIMIT, (page - 1) * LIMIT);

    const [logs] = await db.query(sql, params);

    return NextResponse.json({ logs, count: total });
  } catch (error) {
    console.error("Logs error:", error);
    return NextResponse.json({ logs: [], count: 0, error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}