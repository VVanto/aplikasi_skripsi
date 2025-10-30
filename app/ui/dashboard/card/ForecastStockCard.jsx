"use client";

import { useState, useEffect } from "react";

const ForecastStockCard = () => {
  const [forecast, setForecast] = useState({
    name: "Belum ada",
    currentStock: 0,
    dailySales: 0,
    daysLeft: 0,
    risk: "low",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch("/api/dashboard/forecast-stock", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setForecast(data);
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
    critical: "text-red",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green",
  }[forecast.risk];

  const formatDays = (days) => {
    if (days <= 0) return "Habis!";
    if (days < 1) return "< 1 hari";
    if (days === 1) return "1 hari";
    return `${Math.ceil(days)} hari`;
  };

  if (loading) {
    return (
      <div className="bg-olive p-5 rounded-lg flex gap-5 animate-pulse">
        <div className="w-14 h-14 bg-gray-700 rounded-full"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-700 rounded w-36"></div>
          <div className="h-6 bg-gray-700 rounded w-28"></div>
          <div className="h-5 bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-14 rounded-lg flex gap-5 cursor-pointer hover:bg-lightOlive transition-all shadow-md">
   

      <div className="flex flex-col gap-2 flex-1">
        <span className="text-lg font-medium text-cream/90">
          Prediksi Stok Habis
        </span>

        <span className="text-2xl font-bold text-cream truncate">
          {forecast.name}
        </span>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-cream/70">
            Sisa: <strong>{forecast.currentStock}</strong> {forecast.satuan}
          </span>
          <span className="text-cream/50">•</span>
          <span className="text-cream/70">
            Terjual: <strong>{forecast.dailySales}</strong>/hari
          </span>
        </div>

        <div className="mt-1">
          <span className={`text-xl font-bold ${riskColor}`}>
            {formatDays(forecast.daysLeft)}
          </span>
          <span className="text-sm text-cream/60 ml-2">
            lagi habis
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastStockCard;