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

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  useEffect(() => {
    const fetchData = async () => {
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

  const formatDate = (date) => {
    if (!date || date === "0000-00-00 00:00:00") return "-";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toString().slice(4, 25);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  if (error) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-olive">
        <div className="text-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Nama..." />
        <Link href="/dashboard/transaction/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
            Tambahkan
          </button>
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="p-3">
            <td>Ditambahkan oleh User</td>

            <td>Tanggal</td>
            <td>Total Harga</td>
            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((trx) => (
            <tr key={trx.id} className="p-3">
              <td>{trx.name}</td>

              <td>{formatDate(trx.createdAt)}</td>
              <td>{formatPrice(trx.totalHarga)}</td>
              <td>
                <Link href={`/dashboard/transaction/${trx.id}`}>
                  <button className="bg-blue-900 py-1 px-3 rounded-lg border-none cursor-pointer mr-2">
                    Lihat
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(trx.id)}
                  className="bg-red-800 py-1 px-3 rounded-lg border-none cursor-pointer"
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
