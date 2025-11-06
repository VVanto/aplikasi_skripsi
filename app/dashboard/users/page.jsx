"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "../loading";

export default function UsersPage({ searchParams }) {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // ← USER YANG LOGIN
  const [loading, setLoading] = useState(true);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  // Ambil user yang login
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Gagal ambil user login:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Ambil daftar user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users?q=${q}&page=${page}`);
        const data = await res.json();
        setUsers(data.users || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error("Gagal fetch User:", error);
      }
    };
    fetchUsers();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin hapus user ini?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus");
      setUsers(users.filter((u) => u.id !== id));
      setCount((prev) => prev - 1);
      alert("User dihapus!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };


  if (loading) {
    return <Loading />;
  }

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex justify-between items-center mb-5">
        <Search placeholder="Cari nama..." />

  
        {isAdmin && (
          <Link href="/dashboard/users/add">
            <button className="bg-sage px-4 py-2 rounded-lg font-medium hover:bg-sage/80 transition">
              Tambahkan
            </button>
          </Link>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10 text-cream/70">
          Tidak ada user ditemukan
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-cream/80 border-b border-lightOlive">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Dibuat</th>
                  <th className="p-3">Role</th>
                  {isAdmin && <th className="p-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-lightOlive/30 hover:bg-olive/50 transition"
                  >
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded font-medium ${
                          user.role ? "bg-maroon" : "bg-darkGreen"
                        }`}
                      >
                        {user.role ? "Admin" : "Staf"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {isAdmin ? (
                        <>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <button className="bg-blue px-3 py-1 rounded mr-2 hover:bg-blue transition">
                              Lihat
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red px-3 py-1 rounded hover:bg-red/80 transition"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <td className="p-3 text-center text-cream/50">—</td>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination count={count} />
        </>
      )}
    </div>
  );
}
