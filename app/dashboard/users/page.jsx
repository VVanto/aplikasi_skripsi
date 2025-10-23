"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsersPage({ searchParams }) {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(q)}&page=${page}`);
        const data = await res.json();
        setUsers(data.users || data); // Jika API return array langsung, pakai data; jika object {users, count}, pakai data.users
        setCount(data.count || data.length); // Hitung total count dari data.count atau length jika all data
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin hapus user ini?")) return; // Konfirmasi sederhana
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Gagal hapus user");
      }
      setUsers(users.filter((user) => user.id !== id));
      setCount((prevCount) => prevCount - 1);
      alert("User berhasil dihapus!"); // Optional feedback
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message); // Tampilkan error ke user
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Username..." />
        <Link href="/dashboard/users/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
            Tambahkan
          </button>
        </Link>
      </div>

      <table className="w-full">
        <thead>
          <tr className="p-3">
            <td>Nama</td>
            <td>Username</td>
            <td>Dibuat pada</td>
            <td>Role</td>
            <td>Tindakan</td>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="p-3">
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{new Date(user.createdAt).toString().slice(4, 25)}</td>
              <td>{user.role ? "Admin" : "Staf"}</td>
              <td>
                <Link href={`/dashboard/users/${user.id}`}>
                  <button className="bg-blue-900 py-1 px-3 rounded-lg cursor-pointer mr-2">
                    Lihat
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-800 py-1 px-3 rounded-lg cursor-pointer"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination count={count} />
    </div>
  );
}