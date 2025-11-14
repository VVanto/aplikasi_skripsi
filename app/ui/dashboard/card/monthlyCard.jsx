"use client";

import { useState, useEffect } from "react";
import { MdAttachMoney } from "react-icons/md";

const MonthlySalesCard = () => {
  const [data, setData] = useState({ total: 0, percentageChange: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/monthly-sales", {
          credentials: "include",
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Gagal ambil penjualan bulan ini:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60_000); // tiap menit
    return () => clearInterval(interval);
  }, []);

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  const isPositive = data.percentageChange >= 0;

  if (loading) {
    return (
      <div className="bg-olive p-5 rounded-lg flex gap-5 animate-pulse w-[300px]">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-6 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-olive p-14 rounded-lg flex transition-all">
      <div className="flex flex-col gap-3">
        <span className=" text-lg font-medium">Penjualan Bulan Ini</span>
        <span className="text-3xl font-medium ">
          {formatRupiah(data.total)}
        </span>
        <span className="text-xl font-light ">
          <span className={isPositive ? "text-green" : "text-red"}>
            {isPositive ? "+" : ""}
            {data.percentageChange}%
          </span>
          <span> </span>
          dari bulan lalu
        </span>
      </div>
    </div>
  );
};

export default MonthlySalesCard;
