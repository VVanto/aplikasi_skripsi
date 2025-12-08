"use client";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";
import { useEffect, useState } from "react";
import Loading from "../loading";

export default function TransaksiPage({ searchParams }) {
  const { success, error, confirm } = useAlert();
  const [transaksi, setTransaksi] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Live clock state
  const [now, setNow] = useState(new Date());

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  // Update jam setiap detik
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------------------------------------
     1. Ambil user login
  ------------------------------------------------- */
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

  /* -------------------------------------------------
     2. Ambil data transaksi
  ------------------------------------------------- */
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
      } catch (err) {
        console.error(err);
        error(err.message);
        setTransaksi([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [q, page, error]);

  /* -------------------------------------------------
     3. Hapus transaksi
  ------------------------------------------------- */
  const handleDelete = async (id) => {
    confirm("Apakah Anda yakin ingin menghapus transaksi ini?", async () => {
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
        success("Transaksi berhasil dihapus!");
      } catch (err) {
        error(`Gagal menghapus: ${err.message}`);
      } finally {
        setDeletingId(null);
      }
    });
  };

  /* -------------------------------------------------
     4. FORMAT TANGGAL + JAM LIVE (LOKAL USER)
  ------------------------------------------------- */
  const formatDate = (dateString) => {
    if (!dateString || dateString.includes("0000-00-00")) return "-";

    const date = new Date(dateString);

    // Cek apakah transaksi hari ini
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const datePart = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let timePart;
    if (isToday) {
      // Hari ini → jam + detik + live
      timePart = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else {
      // Bukan hari ini → jam biasa (tanpa detik)
      timePart = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return `${datePart}, ${timePart}`;
  };

  const formatPrice = (price) => {
    if (price == null) return "Rp 0";
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  /* -------------------------------------------------
     5. Loading state
  ------------------------------------------------- */
  if (loading || userLoading) return <Loading />;

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between mb-5">
        <Search placeholder="Cari Nama..." />
        {isAdmin && (
          <Link href="/dashboard/transaction/add">
            <button className="bg-sage px-4 py-2 rounded-lg cursor-pointer font-medium hover:bg-sage/80 transition">
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
              <th className="pb-3">Tanggal & Jam</th>
              <th className="pb-3">Total Harga</th>
              {isAdmin ? <th className="pb-3">Tindakan</th> : <th className="pb-3">Detail</th>}
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
              transaksi.map((trx) => {
                const trxDate = new Date(trx.createdAt);
                const isToday =
                  trxDate.getFullYear() === now.getFullYear() &&
                  trxDate.getMonth() === now.getMonth() &&
                  trxDate.getDate() === now.getDate();

                return (
                  <tr
                    key={trx.id}
                    className="border-b border-cream/10 hover:bg-olive/50 transition"
                  >
                    <td className="py-3">{trx.name || "-"}</td>
                    <td className="py-3 font-medium">
                      <span className={isToday ? "text-green-400" : ""}>
                        {formatDate(trx.createdAt)}
                      </span>
                      {isToday && (
                        <span className="ml-2 animate-pulse">Live</span>
                      )}
                    </td>
                    <td className="py-3 font-medium">{formatPrice(trx.totalHarga)}</td>
                    <td className="py-3 flex gap-2">
                      <Link href={`/dashboard/transaction/${trx.id}`}>
                        <button className="bg-blue py-1 px-3 rounded-lg text-sm hover:bg-blue/80 transition">
                          Lihat
                        </button>
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(trx.id)}
                          disabled={deletingId === trx.id}
                          className="bg-red py-1 px-3 rounded-lg text-sm hover:bg-red/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === trx.id ? "..." : "Hapus"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination count={count} />
    </div>
  );
}