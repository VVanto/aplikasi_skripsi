"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsersPage({ searchParams }) {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const q = searchParams?.q || "";
  const page = Math.max(1, parseInt(searchParams?.page) || 1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users?q=${q}&page=${page}`);
        const data = await res.json();
        setUsers(data.users || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error("Fetch users error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin hapus user ini?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus");
      setUsers(users.filter(u => u.id !== id));
      setCount(prev => prev - 1);
      alert("User dihapus!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5 animate-pulse">
        <div className="h-10 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex justify-between items-center mb-5">
        <Search placeholder="Cari nama atau username..." />
        <Link href="/dashboard/users/add">
          <button className="bg-sage px-4 py-2 rounded-lg font-medium hover:bg-sage/80 transition">
            + Tambah User
          </button>
        </Link>
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
                <tr className="text-left text-cream/80 text-sm border-b border-lightOlive">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Dibuat</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Aksi</th>
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
                    <td className="p-3 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role ? "bg-blue-900 text-blue-200" : "bg-gray-700 text-gray-300"
                      }`}>
                        {user.role ? "Admin" : "Staf"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Link href={`/dashboard/users/${user.id}`}>
                        <button className="bg-blue-900 text-xs px-3 py-1 rounded mr-2 hover:bg-blue-800 transition">
                          Lihat
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red text-xs px-3 py-1 rounded hover:bg-red/80 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <Pagination count={count} />
          </div>
        </>
      )}
    </div>
  );
}