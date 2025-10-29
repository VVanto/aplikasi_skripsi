import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  let db = null;

  try {
    // Ambil koneksi dari pool
    db = await getConnection();

    // Query users (jangan tampilkan password!)
    const sql = "SELECT id, name, username, role, createdAt FROM users ORDER BY id DESC";
    const [users] = await db.query(sql);

    return NextResponse.json(users);

  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        db.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

export async function POST(request) {
  let db = null;

  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    // Validasi input
    if (!name || !username || !password || role === undefined) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    // Cek apakah username sudah ada
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const sql = `
      INSERT INTO users (name, username, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name,
      username,
      hashedPassword,
      role === "true" || role === true || role === 1 ? 1 : 0,
    ]);

    return NextResponse.json(
      { message: "User berhasil ditambahkan", id: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        db.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}