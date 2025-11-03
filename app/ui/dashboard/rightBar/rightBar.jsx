"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const RightBar = () => {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await fetch("/api/dashboard/low-stock", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setLowStock(data.lowStock || []);
        }
      } catch (err) {
        console.error("Gagal ambil stok rendah:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed right-0 top-20 w-80 bg-olive/90 backdrop-blur-sm p-5 mr-5 rounded-lg shadow-lg animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 w-[300px] bg-olive/90 backdrop-blur-sm p-5 mr-5 rounded-lg shadow-lg border border-cream/10">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-cream">Peringatan Stok</h3>
          <p className="text-sm text-cream/70">
            {lowStock.length > 0
              ? `${lowStock.length} produk di bawah 10%`
              : "Semua stok aman!"}
          </p>
        </div>
      </div>

      {lowStock.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-2">Stok aman</div>
          <p className="text-cream/70">Tidak ada stok kritis</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {lowStock.map((item) => (
            <Link
              href={`/dashboard/products/${item.id}`}
              key={item.id}
              className="block p-3 bg- border border-lightOlive rounded-lg hover:bg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-cream truncate text-sm">
                    {item.name}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-red-300 font-bold">
                      {item.percentage}%
                    </span>
                  </div>

                  <p className="text-xs text-cream/70 mt-1">
                    {item.stok} / {item.maxStock} {item.satuan}
                  </p>
                </div>

                <span className="text-xs bg-red px-2 py-1 rounded-full">
                  {item.percentage < 5 ? "Kritis" : "Rendah"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {lowStock.length > 0 && (
        <Link
          href="/dashboard/products"
          className="block text-center mt-4 text-sm text-cream underline hover:text-white transition"
        >
          Lihat semua produk
        </Link>
      )}
    </div>
  );
};

export default RightBar;
