import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const db = await createConnection();
    const sql = "SELECT * FROM users";
    const [users] = await db.query(sql);
    return NextResponse.json(users);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || !password || role === undefined) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const db = await createConnection();

    // Hash password dengan bcrypt (10 adalah salt rounds, cukup aman)
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      name,
      username,
      hashedPassword, // Simpan password yang sudah di-hash
      role === "true" ? 1 : 0,
    ]);

    return NextResponse.json(
      { message: "User berhasil ditambahkan", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}