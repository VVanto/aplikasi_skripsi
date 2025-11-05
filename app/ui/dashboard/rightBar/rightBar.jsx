"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdClose, MdNotifications } from "react-icons/md";

const RightBar = () => {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-5 top-30 z-50 bg-olive hover:bg-olive/80 text-cream px-4 py-3 rounded-lg shadow-lg transition-all border border-cream/10 flex items-center gap-2"
      >
        <MdNotifications size={20} />
        <span className="font-semibold">Stok</span>
        {lowStock.length > 0 && (
          <span className="bg-red text-white text-xs px-2 py-0.5 rounded-full">
            {lowStock.length}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[350px] bg-olive backdrop-blur-sm p-5 shadow-2xl z-50 border-l border-cream/10 animate-slide-in">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-cream">Peringatan Stok</h3>
                <p className="text-sm text-cream/70">
                  {lowStock.length > 0
                    ? `${lowStock.length} produk di bawah 20%`
                    : "Semua stok aman!"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cream hover:text-white transition"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <div className="text-center py-12">

                <p className="text-cream font-semibold">Stok Aman</p>
                <p className="text-cream/70 text-sm">Tidak ada stok kritis</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {lowStock.map((item) => (
                  <Link
                    href={`/dashboard/products/${item.id}`}
                    key={item.id}
                    onClick={() => setIsOpen(false)}
                    className="block p-3 bg-lightOlive/50 border border-lightOlive rounded-lg hover:bg-lightOlive transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-cream text-sm line-clamp-2 leading-tight">
                          {item.name}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-red h-2.5 rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-300 font-bold whitespace-nowrap">
                            {item.percentage}%
                          </span>
                        </div>

                        <p className="text-xs text-cream/70 mt-1">
                          {item.stok} / {item.maxStock} {item.satuan}
                        </p>
                      </div>

                      <span className="text-xs bg-red text-white px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                        {item.percentage < 5 ? "Kritis" : "Rendah"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Footer */}
            {lowStock.length > 0 && (
              <Link
                href="/dashboard/products"
                onClick={() => setIsOpen(false)}
                className="block text-center mt-4 text-sm text-cream underline hover:text-cream/60 transition"
              >
                Lihat semua produk
              </Link>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default RightBar;