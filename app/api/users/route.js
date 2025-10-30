// app/api/users/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const LIMIT = 5;

export async function GET(request) {
  let db = null;
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

    db = await getConnection();

    // Count total
    let countSql = "SELECT COUNT(*) as total FROM users";
    let countParams = [];
    if (q) {
      countSql += " WHERE username LIKE ? OR name LIKE ?";
      countParams.push(`%${q}%`, `%${q}%`);
    }
    const [countResult] = await db.query(countSql, countParams);
    const total = countResult[0].total;

    // Get users
    let sql = "SELECT id, name, username, role, createdAt FROM users";
    let params = [];
    if (q) {
      sql += " WHERE username LIKE ? OR name LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(LIMIT, (page - 1) * LIMIT);

    const [users] = await db.query(sql, params);

    return NextResponse.json({ users, count: total });
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}

// POST tetap sama
export async function POST(request) {
  let db = null;
  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || !password || role === undefined) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    }

    db = await getConnection();

    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, hashed, role ? 1 : 0]
    );

    return NextResponse.json({ message: "User ditambahkan", id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}