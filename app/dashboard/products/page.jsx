"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";

export default function ProductsPage({ searchParams }) {
  const { success, error, confirm } = useAlert();
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&page=${page}`);
        if (!res.ok) throw new Error(`Gagal fetch produk: ${res.statusText}`);
        const data = await res.json();
        setProducts(data.products || []);
        setCount(data.count || 0);
      } catch (err) {
        error(err.message);
      }
    };
    fetchData();
  }, [q, page, error]);

  const handleDelete = async (id) => {
    confirm("Yakin ingin hapus produk ini?", async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal hapus produk");
        setProducts(prev => prev.filter(p => p.id !== id));
        setCount(prev => prev - 1);
        success("Produk berhasil dihapus!");
      } catch (err) {
        error(err.message);
      }
    });
  };

  const formatPrice = (price) => `Rp ${Number(price).toLocaleString("id-ID")}`;
  const formatDate = (date) => {
    if (!date || date === "0000-00-00 00:00:00") return "-";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "-" : d.toString().slice(4, 25);
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between mb-5">
        <Search placeholder="Cari Produk..." />
        <Link href="/dashboard/products/add">
          <button className="bg-sage p-2 rounded-lg hover:bg-sage/80 transition">Tambahkan</button>
        </Link>
      </div>

      <table className="w-full">
        <thead>
          <tr className="p-3 text-left text-cream/80">
            <td>Nama Produk</td>
            <td>Kategori</td>
            <td>Deskripsi</td>
            <td>Harga</td>
            <td>Dibuat pada</td>
            <td>Stok</td>
            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="7" className="text-center py-8 text-cream/70">Tidak ada Produk ditemukan</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="p-3 border-t border-lightOlive/30">
                <td>{product.name}</td>
                <td>{product.kate}</td>
                <td>{product.deskrip || "-"}</td>
                <td>{formatPrice(product.harga)}</td>
                <td>{formatDate(product.createdAt)}</td>
                <td>{product.stok} {product.satuan}</td>
                <td>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <button className="bg-blue py-1 px-3 rounded-lg mr-2 hover:bg-blue/80 transition">Lihat</button>
                  </Link>
                  <button onClick={() => handleDelete(product.id)} className="bg-red py-1 px-3 rounded-lg hover:bg-red/80 transition">
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
}