"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function SingleTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [transaksi, setTransaksi] = useState(null);
  const [detailtransaksi, setDetailtransaksi] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="bg-olive p-5 rounded-lg mt-5">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-olive p-5 rounded-lg mt-5">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Detail Transaksi #{transaksi.id}
        </h2>
        <p>Nama User: {transaksi.name}</p>
        <p>Username: {transaksi.username}</p>
        <p>Tanggal: {formatDate(transaksi.createdAt)}</p>
        <p>Total Harga: {formatPrice(transaksi.totalHarga)}</p>
      </div>
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <h3 className="text-xl font-bold mb-4">List Item</h3>
        <table className="w-full">
          <thead>
            <tr className="p-3">
              <td>ID</td>
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
                <td colSpan="6" className="text-center p-3">
                  Tidak ada item
                </td>
              </tr>
            ) : (
              detailtransaksi.map((item) => (
                <tr key={item.id} className="p-3">
                  <td>{item.id}</td>
                  <td>{item.namaBarang}</td>
                  <td>{item.kategoriBarang}</td>
                  <td>{item.jumlahBarang}</td>
                  <td>{formatPrice(item.hargaSatuan)}</td>
                  <td>{formatPrice(item.subTotal)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
