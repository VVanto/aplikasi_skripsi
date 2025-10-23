"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsersPage({ searchParams }) {
  const [users, setUsers] = useState([]);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("/api/users");
        const response = await data.json();
        console.log(response);
        setUsers(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

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
{/* 
      <Pagination count={count} /> */}
    </div>
  );
}
