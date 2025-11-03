"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ForecastStockCard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch("/api/dashboard/forecast-stock", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
          setMessage(data.message || "");
        }
      } catch (err) {
        console.error("Gagal ambil forecast:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
    const interval = setInterval(fetchForecast, 60_000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = {
    critical: "text-red-500",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  const riskBg = {
    critical: "bg-red-900/50 border-red-500",
    high: "bg-orange-900/30 border-orange-500",
    medium: "bg-yellow-900/20 border-yellow-500",
    low: "bg-green-900/20 border-green-500",
  };

  const formatDays = (days) => {
    if (days <= 0) return "Habis!";
    if (days < 1) return "< 1 hari";
    if (days === 1) return "1 hari";
    return `${Math.ceil(days)} hari`;
  };

  if (loading) {
    return (
      <div className="bg-olive p-6 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-4">

        <h3 className="text-lg font-bold text-cream">
          Prediksi Stok Habis Terdekat
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-cream/70">
          <div className="text-5xl mb-2">All good</div>
          <p>{message || "Tidak ada stok kritis"}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <Link
              href={`/dashboard/products/${item.id}`}
              key={item.id}
              className={`block p-4 rounded-lg border transition-all hover:shadow-lg ${riskBg[item.risk]}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-cream truncate">
                    #{index + 1} {item.name}
                  </p>
                  <p className="text-xs text-cream/70">
                    Sisa: <strong>{item.currentStock}</strong> {item.satuan} •
                    Terjual: <strong>{item.dailySales}</strong>/hari
                  </p>
                </div>
                <span className={`text-lg font-bold ${riskColor[item.risk]}`}>
                  {formatDays(item.daysLeft)}
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.risk === "critical" ? "bg-red-500" :
                      item.risk === "high" ? "bg-orange-400" :
                        item.risk === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  style={{
                    width: `${Math.min((item.currentStock / (item.currentStock + item.dailySales * 7)) * 100, 100)}%`
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Link
          href="/dashboard/products"
          className="block text-center mt-4 text-sm text-cream underline hover:text-sage transition"
        >
          Lihat semua produk
        </Link>
      )}
    </div>
  );
};

export default ForecastStockCard;