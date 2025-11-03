// ✏️ UPDATED: app/api/logs/route.js
// Perubahan: Fix JOIN di COUNT query untuk search

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

    // Count - FIX: tambahkan JOIN untuk search by user name
    let countSql = `
      SELECT COUNT(*) as total 
      FROM logaktivitas l
      LEFT JOIN users u ON l.userId = u.id
    `;
    let countParams = [];
    if (q) {
      countSql += " WHERE l.deskrip LIKE ? OR u.name LIKE ?";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    const [countRes] = await db.query(countSql, countParams);
    const total = countRes[0].total;

    // Data
    let sql = `
      SELECT 
        l.id, l.timestamp, l.deskrip, l.createdAt,
        u.name AS userName, u.username
      FROM logaktivitas l
      LEFT JOIN users u ON l.userId = u.id
    `;
    let params = [];
    if (q) {
      sql += " WHERE l.deskrip LIKE ? OR u.name LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY l.createdAt DESC LIMIT ? OFFSET ?";
    params.push(LIMIT, (page - 1) * LIMIT);

    const [logs] = await db.query(sql, params);

    return NextResponse.json({ logs, count: total });
  } catch (error) {
    console.error("Logs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}