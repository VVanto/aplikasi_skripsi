"use client";

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

  // Format Rupiah
  const formatRupiah = (value) => `Rp ${(value || 0).toLocaleString("id-ID")}`;

  // Custom Tooltip
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
      <div className="h-[450px] bg-olive rounded-lg p-5 flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[450px] bg-olive text-cream rounded-lg p-5 flex items-center justify-center">
        <p className="text-red-400">
          {error || "Belum ada transaksi"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[450px] bg-olive text-cream rounded-lg p-5">
      <h2 className="mb-5 text-xl font-semibold">Riwayat Transaksi</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="name" 
            stroke="#ccc" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            fontSize={12}
          />
          <YAxis stroke="#ed2788" tickFormatter={formatRupiah} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#ed2788"
            name="Total Harga"
            strokeWidth={2}
            dot={{ fill: "#ed2788", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;