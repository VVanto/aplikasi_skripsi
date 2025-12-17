"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../../loading";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SingleTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [transaksi, setTransaksi] = useState(null);
  const [detailtransaksi, setDetailtransaksi] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Ambil user login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Gagal ambil user:", err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Ambil data transaksi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/transaction/${id}`);
        if (!res.ok) {
          throw new Error(`Gagal fetch transaksi: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTransaksi(data.transaksi);
        setDetailtransaksi(
          Array.isArray(data.detailtransaksi) ? data.detailtransaksi : []
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  // Hitung total dari semua sub total
  const calculateTotal = () => {
    return detailtransaksi.reduce((total, item) => {
      return total + (Number(item.subTotal) || 0);
    }, 0);
  };

  // Fungsi export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(`Detail Transaksi #${transaksi.id}`, 14, 20);

    doc.setFontSize(11);
    doc.text(`Ditambahkan oleh: ${transaksi.name}`, 14, 30);
    doc.text(`Username: ${transaksi.username}`, 14, 37);
    doc.text(`Tanggal: ${formatDate(transaksi.createdAt)}`, 14, 44);
    doc.text(`Total Harga: ${formatPrice(transaksi.totalHarga)}`, 14, 51);

    // Table
    const tableData = detailtransaksi.map((item) => [
      item.barangId,
      item.namaBarang,
      item.kategoriBarang,
      item.jumlahBarang,
      formatPrice(item.hargaSatuan),
      formatPrice(item.subTotal),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        [
          "ID Barang",
          "Nama Barang",
          "Kategori",
          "Jumlah",
          "Harga Satuan",
          "Sub Total",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [139, 142, 107] }, // warna sage
      styles: { fontSize: 9 },
    });

    // Tambahkan total di PDF
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Total: ${formatPrice(calculateTotal())}`, 14, finalY + 10);

    // Save PDF
    doc.save(`Transaksi-${transaksi.id}.pdf`);
  };

  // Tunggu semua loading selesai
  if (loading || userLoading) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5">
        <p className="text-red">Error: {error}</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <h2 className="text-2xl font-bold mb-20">
          Detail Transaksi #{transaksi.id}
        </h2>
        <p>Ditambahkan oleh: {transaksi.name}</p>
        <p>Username: {transaksi.username}</p>
        <p>Tanggal: {formatDate(transaksi.createdAt)}</p>
        <p>Total Harga: {formatPrice(transaksi.totalHarga)}</p>
      </div>

      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-4">List Item</h3>
          <button
            onClick={handleExportPDF}
            className="bg-sage px-4 py-1 rounded-lg cursor-pointer font-medium hover:bg-sage/80 transition"
          >
            Print PDF
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="p-3 text-cream/80">
              <td>ID Barang</td>
              <td>Nama Barang</td>
              <td>Kategori</td>
              <td>Jumlah Barang</td>
              <td>Harga Satuan</td>
              <td>Sub Total</td>
            </tr>
          </thead>
          <tbody>
            {detailtransaksi.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-3 text-cream/70">
                  Tidak ada item
                </td>
              </tr>
            ) : (
              detailtransaksi.map((item) => (
                <tr
                  key={item.detailId}
                  className="p-3 hover:bg-lightOlive/30 transition"
                >
                  <td>{item.barangId}</td>
                  <td>
                    {isAdmin ? (
                      <Link
                        href={`/dashboard/products/${item.barangId}`}
                        className="text-cream hover:text-cream/50 hover:font-medium transition"
                      >
                        {item.namaBarang}
                      </Link>
                    ) : (
                      <span className="text-cream/70">{item.namaBarang}</span>
                    )}
                  </td>
                  <td>{item.kategoriBarang}</td>
                  <td>{item.jumlahBarang}</td>
                  <td>{formatPrice(item.hargaSatuan)}</td>
                  <td>{formatPrice(item.subTotal)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-cream/20">
              <td colSpan="5" className="p-3 text-right font-bold">
                Total:
              </td>
              <td className="p-3 font-bold">
                {formatPrice(calculateTotal())}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}