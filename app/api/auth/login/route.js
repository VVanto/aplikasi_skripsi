// app/api/auth/login/route.js
import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  let db = null;

  try {
    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    // Validasi JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET tidak ada di .env.local");
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }

    // Ambil koneksi dari pool
    db = await getConnection();

    // Cari user (hanya ambil field penting)
    const [users] = await db.query(
      "SELECT id, username, password, name, role FROM users WHERE username = ?",
      [username]
    );

    // User tidak ditemukan
    if (users.length === 0) {
      console.log("❌ User tidak ditemukan:", username);
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const user = users[0];

    // 🔍 DEBUG: Cek password hash
    console.log("=== LOGIN DEBUG ===");
    console.log("🔍 Username:", username);
    console.log("🔍 Password input (length):", password.length);
    console.log("🔍 Hash dari database:", user.password);
    console.log("🔍 Hash valid (starts with $2b$ or $2a$)?", 
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$")
    );

    // Validasi password
    const isValid = await bcrypt.compare(password, user.password);
    
    console.log("🔍 Hasil bcrypt.compare:", isValid);
    console.log("==================");

    if (!isValid) {
      console.log("❌ Password tidak cocok untuk user:", username);
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    console.log("✅ Login berhasil untuk user:", username);

    // Pastikan role & name selalu ada
    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      role: user.role || "user", // default role
    };

    // Buat JWT
    const token = await new SignJWT(safeUser)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(JWT_SECRET);

    // Response
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: safeUser,
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 jam
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  } finally {
    // Hanya release jika dari pool
    if (db && typeof db.release === "function") {
      try {
        db.release();
      } catch (e) {
        console.error("Gagal release koneksi:", e);
      }
    }
  }
}