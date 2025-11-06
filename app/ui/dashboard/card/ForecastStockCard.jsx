"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const ForecastStockCard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                }
            } catch (err) {
                console.error("Gagal ambil user:", err);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []);

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

    if (loading || userLoading) {
        return (<div className="bg-olive p-5 rounded-lg animate-pulse max-w-md">
            <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-700 rounded"></div>
                ))}
            </div>
        </div>);
    }

    const isAdmin = currentUser?.role === 1;

    return (
        <div className="bg-olive p-5 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-base font-bold text-cream mb-4">
                Prediksi Stok Habis Terdekat
            </h3>

            {items.length === 0 ? (
                <div className="text-center py-8 text-cream/70">
                    <div className="text-5xl mb-2">Checkmark</div>
                    <p className="text-sm">{message || "Tidak ada stok kritis"}</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {items.map((item, index) => {
                        const content = (
                            <div
                                className={`block p-3 rounded-lg border transition-all ${isAdmin ? "hover:shadow-lg cursor-pointer" : "cursor-default opacity-90"
                                    } ${riskBg[item.risk]}`}
                            >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-cream text-sm truncate">
                                            #{index + 1} {item.name}
                                        </p>
                                        <p className="text-xs text-cream/70 mt-0.5">
                                            Sisa: <strong>{item.currentStock}</strong> {item.satuan}
                                        </p>
                                        <p className="text-xs text-cream/70">
                                            Terjual: <strong>{item.dailySales}</strong>/hari
                                        </p>
                                    </div>
                                    <span className={`text-base font-bold whitespace-nowrap ${riskColor[item.risk]}`}>
                                        {formatDays(item.daysLeft)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${item.risk === "critical" ? "bg-red-500" :
                                            item.risk === "high" ? "bg-orange-400" :
                                                item.risk === "medium" ? "bg-yellow-400" : "bg-green-400"
                                            }`}
                                        style={{ width: `${Math.min((item.currentStock / (item.currentStock + item.dailySales * 7)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );

                        return isAdmin ? (
                            <Link href={`/dashboard/products/${item.id}`} key={item.id}>
                                {content}
                            </Link>
                        ) : (
                            <div key={item.id}>{content}</div>
                        );
                    })}
                </div>
            )}

            {items.length > 0 && isAdmin && (
                <Link
                    href="/dashboard/products"
                    className="block text-center mt-4 text-sm text-cream underline hover:text-cream/60 transition"
                >
                    Lihat semua produk
                </Link>
            )}
        </div>
    );
};

export default ForecastStockCard;