import { createConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(request, { params }) {
  try {
    const db = await createConnection();
    const id = params.id;
    const sql = "SELECT * FROM users WHERE id = ?";
    const [users] = await db.query(sql, [id]);

    if (users.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = await createConnection();
    const id = params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, username, password, role } = body;
    const id = params.id;

    if (!name || !username || role === undefined) {
      return NextResponse.json(
        { error: "Field nama, username, dan role harus diisi" },
        { status: 400 }
      );
    }

    const db = await createConnection();

    let sql = "UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?";
    let values = [name, username, role === "true" ? 1 : 0, id];

    if (password) {
      // Hash password jika diisi
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = "UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?";
      values = [name, username, hashedPassword, role === "true" ? 1 : 0, id];
    }

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}