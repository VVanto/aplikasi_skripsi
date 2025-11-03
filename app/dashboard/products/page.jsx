"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsPage({ searchParams }) {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);

  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(q)}&page=${page}`
        );
        if (!res.ok) {
          throw new Error(`Gagal fetch produk: ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data.products || []);
        setCount(data.count || 0);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin hapus produk ini?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Gagal hapus produk");
      }
      setProducts(products.filter((product) => product.id !== id));
      setCount((prevCount) => prevCount - 1);
      alert("Produk berhasil dihapus!");
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  const formatDate = (date) => {
    if (!date || date === "0000-00-00 00:00:00") return "-";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? "-"
      : parsedDate.toString().slice(4, 25);
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Produk..." />
        <Link href="/dashboard/products/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer hover:bg-sage/80 transition">
            Tambahkan
          </button>
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="p-3">
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
          {products.map((product) => (
            <tr key={product.id} className="p-3">
              <td>{product.name}</td>
              <td>{product.kate}</td>
              <td>{product.deskrip || "-"}</td>
              <td>{formatPrice(product.harga)}</td>
              <td>{formatDate(product.createdAt)}</td>
              <td>
                {product.stok} {product.satuan}
              </td>
              <td>
                <Link href={`/dashboard/products/${product.id}`}>
                  <button className="bg-blue py-1 px-3 rounded-lg border-none cursor-pointer mr-2 hover:bg-blue transition">
                    Lihat
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red py-1 px-3 rounded-lg border-none cursor-pointer"
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
