"use client";

import { useState, useEffect } from "react";

const TopProductCard = () => {
  const [product, setProduct] = useState({ name: "Belum ada", sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProduct = async () => {
      try {
        const res = await fetch("/api/dashboard/top-product", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Gagal ambil produk terlaris:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProduct();
    const interval = setInterval(fetchTopProduct, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-olive p-5 rounded-lg flex gap-5 animate-pulse">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-6 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-14 rounded-lg flex  cursor-pointer hover:bg-lightOlive transition-all">

      <div className="flex flex-col gap-3">
        <span className=" text-lg font-medium">Produk Terlaris</span>
        <span className="text-3xl font-medium">
          {product.name}
        </span>
        <span className="text-xl font-light">
          <span className="text-yellow-400 font-semibold">{product.sales}</span> kali dibeli
        </span>
      </div>
    </div>
  );
};

export default TopProductCard;