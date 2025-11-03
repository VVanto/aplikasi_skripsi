// ✏️ UPDATED: app/api/users/route.js
// Perubahan: Tambah import yang hilang (jwtVerify, cookies, JWT_SECRET)

import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
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

export async function POST(request) {
  let db = null;
  let actorId = null;

  try {
    const { name, username, password, role } = await request.json();

    if (!name || !username || !password || role === undefined) {
      return NextResponse.json({ error: "Field wajib diisi" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return NextResponse.json({ error: "Username sudah ada" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, hashed, role ? 1 : 0]
    );

    await logActivity(db, `Tambah user: ${name} (@${username})`, actorId);

    return NextResponse.json({ message: "Sukses", id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}