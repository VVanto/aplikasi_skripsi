"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TransaksiPage({ searchParams }) {
  const [transaksi, setTransaksi] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // ← USER YANG LOGIN
  const [userLoading, setUserLoading] = useState(true);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  // Ambil user login
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Gagal ambil user login:", err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Ambil data transaksi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/transaction?q=${encodeURIComponent(q)}&page=${page}`
        );
        if (!res.ok) throw new Error(`Gagal fetch: ${res.statusText}`);

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setTransaksi(Array.isArray(data.transaksi) ? data.transaksi : []);
        setCount(data.count || 0);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setTransaksi([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q, page]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus transaksi ini?"
    );
    if (!confirmDelete) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/transaction/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }

      setTransaksi((prev) => prev.filter((trx) => trx.id !== id));
      setCount((prev) => prev - 1);
      alert("Transaksi berhasil dihapus!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date || date === "0000-00-00 00:00:00") return "-";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  // Tunggu user & data selesai loading
  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-olive">
        <div className="text-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between mb-5">
        <Search placeholder="Cari Nama..." />

        {/* HIDE TOMBOL TAMBAHKAN JIKA BUKAN ADMIN */}
        {isAdmin && (
          <Link href="/dashboard/transaction/add">
            <button className="bg-sage px-4 py-2 rounded-lg cursor-pointer font-medium">
              Tambahkan
            </button>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-auto">
          <thead>
            <tr className="text-left border-b border-cream/20">
              <th className="pb-3">User</th>
              <th className="pb-3">Tanggal</th>
              <th className="pb-3">Total Harga</th>
              {isAdmin ? (
                <th className="pb-3">Tindakan</th>
              ) : (
                <th className="pb-3">Detail</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transaksi.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-cream/70">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            ) : (
              transaksi.map((trx) => (
                <tr
                  key={trx.id}
                  className="border-b border-cream/10 hover:bg-olive/50 transition"
                >
                  <td className="py-3">{trx.name || "-"}</td>
                  <td className="py-3">{formatDate(trx.createdAt)}</td>
                  <td className="py-3 font-medium">
                    {formatPrice(trx.totalHarga)}
                  </td>
                  <td className="py-3 flex gap-2">
                    {/* SELALU TAMPILKAN "LIHAT" */}
                    <Link href={`/dashboard/transaction/${trx.id}`}>
                      <button className="bg-blue py-1 px-3 rounded-lg text-sm cursor-pointer hover:bg-blue transition">
                        Lihat
                      </button>
                    </Link>

                    {/* HANYA ADMIN YANG BISA HAPUS */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(trx.id)}
                        disabled={deletingId === trx.id}
                        className="bg-red py-1 px-3 rounded-lg text-sm cursor-pointer hover:bg-red transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === trx.id ? "..." : "Hapus"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination count={count} />
    </div>
  );
}
