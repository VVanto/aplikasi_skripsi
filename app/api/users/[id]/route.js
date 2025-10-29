import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(request, { params }) {
  let db = null;
  
  try {
    // ✅ Langsung akses params.id (tanpa await)
    const id = params.id;
    
    // Ambil koneksi dari pool
    db = await getConnection();
    
    // Jangan return password!
    const sql = "SELECT id, name, username, role FROM users WHERE id = ?";
    const [users] = await db.query(sql, [id]);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(users[0]);

  } catch (error) {
    console.error("User GET by ID error:", error);
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

export async function DELETE(request, { params }) {
  let db = null;
  
  try {
    // ✅ Langsung akses params.id (tanpa await)
    const id = params.id;
    
    // Ambil koneksi dari pool
    db = await getConnection();
    
    const sql = "DELETE FROM users WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User berhasil dihapus" });

  } catch (error) {
    console.error("User DELETE error:", error);
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

export async function PUT(request, { params }) {
  let db = null;
  
  try {
    const body = await request.json();
    const { name, username, password, role } = body;
    // ✅ Langsung akses params.id (tanpa await)
    const id = params.id;

    // Validasi input
    if (!name || !username || role === undefined) {
      return NextResponse.json(
        { error: "Field nama, username, dan role harus diisi" },
        { status: 400 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    // Cek apakah username sudah dipakai user lain
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [username, id]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    let sql, values;

    if (password && password.trim() !== "") {
      // Jika password diisi, hash dan update
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `
        UPDATE users 
        SET name = ?, username = ?, password = ?, role = ? 
        WHERE id = ?
      `;
      values = [
        name,
        username,
        hashedPassword,
        role === "true" || role === true || role === 1 ? 1 : 0,
        id,
      ];
    } else {
      // Jika password kosong, jangan update password
      sql = `
        UPDATE users 
        SET name = ?, username = ?, role = ? 
        WHERE id = ?
      `;
      values = [
        name,
        username,
        role === "true" || role === true || role === 1 ? 1 : 0,
        id,
      ];
    }

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User berhasil diupdate" });

  } catch (error) {
    console.error("User PUT error:", error);
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