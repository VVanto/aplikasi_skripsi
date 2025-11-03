// ✏️ UPDATED: app/api/users/[id]/route.js
// Perubahan:
// - Tambah import yang hilang
// - Tambah logging di PUT
// - FIX CASCADE DELETE: Hapus transaksi, log, kembalikan stok sebelum hapus user
// - Fix await params

import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { logActivity } from "@/app/lib/activity";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request, { params }) {
  let db = null;

  try {
    const { id } = await params;

    db = await getConnection();

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
  let actorId = null;

  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

    db = await getConnection();

    // Ambil data user
    const [user] = await db.query("SELECT name, username FROM users WHERE id = ?", [id]);
    if (user.length === 0) return NextResponse.json({ error: "User tidak ada" }, { status: 404 });

    // Cek apakah user punya transaksi
    const [transaksiCheck] = await db.query(
      "SELECT COUNT(*) as total FROM transaksi WHERE userID = ?", 
      [id]
    );

    // Cek apakah user punya log aktivitas
    const [logCheck] = await db.query(
      "SELECT COUNT(*) as total FROM logaktivitas WHERE userId = ?", 
      [id]
    );

    const totalTransaksi = transaksiCheck[0].total;
    const totalLog = logCheck[0].total;

    // Mulai transaction untuk delete cascade manual
    await db.beginTransaction();

    try {
      // Hapus transaksi dan detail transaksinya
      if (totalTransaksi > 0) {
        // Ambil semua transaksi user
        const [transaksiList] = await db.query(
          "SELECT id FROM transaksi WHERE userID = ?",
          [id]
        );

        // Kembalikan stok untuk setiap transaksi
        for (const trans of transaksiList) {
          const [details] = await db.query(
            "SELECT barangId, jumlahBarang FROM detailtransaksi WHERE transaksiId = ?",
            [trans.id]
          );

          // Kembalikan stok
          for (const detail of details) {
            await db.query(
              "UPDATE products SET stok = stok + ? WHERE id = ?",
              [detail.jumlahBarang, detail.barangId]
            );
          }

          // Hapus detail transaksi
          await db.query("DELETE FROM detailtransaksi WHERE transaksiId = ?", [trans.id]);
        }

        // Hapus semua transaksi user
        await db.query("DELETE FROM transaksi WHERE userID = ?", [id]);
      }

      // Hapus log aktivitas user
      if (totalLog > 0) {
        await db.query("DELETE FROM logaktivitas WHERE userId = ?", [id]);
      }

      // Hapus user
      await db.query("DELETE FROM users WHERE id = ?", [id]);

      // Log aktivitas penghapusan
      await logActivity(
        db, 
        `Hapus user: ${user[0].name} (@${user[0].username}) - ${totalTransaksi} transaksi & ${totalLog} log dihapus`, 
        actorId
      );

      await db.commit();

      return NextResponse.json({ 
        message: "User dihapus beserta data terkait",
        deletedTransaksi: totalTransaksi,
        deletedLogs: totalLog
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}

export async function PUT(request, { params }) {
  let db = null;
  let actorId = null;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || role === undefined) {
      return NextResponse.json(
        { error: "Field nama, username, dan role harus diisi" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Login dulu" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    actorId = payload.id;

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

    await logActivity(db, `Edit user: ${name} (@${username})`, actorId);

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