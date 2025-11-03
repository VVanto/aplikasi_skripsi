"use client";

import Loading from "@/app/dashboard/loading";
import { useState, useEffect } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Chart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Gagal mengambil data");
        const result = await res.json();
        setData(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (value) => `Rp ${(value || 0).toLocaleString("id-ID")}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 text-cream p-3 rounded-lg border border-cream/20 text-sm">
          <p className="font-semibold">{label}</p>
          <p style={{ color: payload[0].color }}>
            Total: {formatRupiah(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
   <Loading/>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[450px] bg-olive text-cream rounded-lg p-5 flex items-center justify-center">
        <p className="text-red-400">
          {error || "Belum ada transaksi bulan ini"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[450px] bg-olive text-cream rounded-lg p-5">
      <h2 className="mb-5 text-xl font-semibold">
        Penjualan per Minggu - {new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })}
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 35, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="name" 
            stroke="#b2c8c1"
            tick={{ fontSize: 13 }}
          />
          <YAxis stroke="#b2c8c1" tickFormatter={formatRupiah} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#b2c8c1"
            name="Total Penjualan"
            strokeWidth={3}
            dot={{ fill: "#3C3D37", r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;