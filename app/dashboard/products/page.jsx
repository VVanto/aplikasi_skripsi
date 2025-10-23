"use client";

import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Image from "next/image";
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

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Produk..." />
        <Link href="/dashboard/products/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
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
              <td>
                <div className="flex items-center gap-3">
                  <Image
                    src="/noavatar.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                  {product.name}
                </div>
              </td>
              <td>{product.kate}</td>
              <td>{product.deskrip || "-"}</td>
              <td>Rp {product.harga}</td>
              <td>{new Date(product.createdAt).toString().slice(4, 25)}</td>
              <td>
                {product.stok} {product.satuan}
              </td>
              <td>
                <Link href={`/dashboard/products/${product.id}`}>
                  <button className="bg-blue-900 py-1 px-3 rounded-lg border-none cursor-pointer mr-2">
                    Lihat
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
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
