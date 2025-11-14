"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const TopProductCard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchTopProducts = async () => {
      try {
        const res = await fetch("/api/dashboard/top-product", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error("Gagal ambil top produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
    const interval = setInterval(fetchTopProducts, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || userLoading) {
    return (<div className="bg-olive p-6 rounded-lg animate-pulse w-[400px]">
      <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>);
  }

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="bg-olive p-6 rounded-lg w-[375px] shadow-md">
      <h3 className="text-lg font-bold text-cream mb-4">
        Produk Terlaris
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-8 text-cream/70">
          <div className="text-5xl mb-2">No sales</div>
          <p>Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {items.map((item, index) => {
            const content = (
              <div
                className={`block p-4 rounded-lg border transition-all ${isAdmin ? "hover:shadow-lg cursor-pointer" : "cursor-default opacity-90"
                  } ${index === 0
                    ? "bg-yellow-900/40 border-yellow-500"
                    : "bg-olive/50 border-lightOlive"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${index === 0 ? "text-yellow-400" :
                          index === 1 ? "text-gray-400" :
                            index === 2 ? "text-orange-600" : "text-cream/70"
                        }`}>
                        #{index + 1}
                      </span>
                      <p className="font-semibold text-cream line-clamp-2">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs text-cream/70 mt-1">
                      {item.sales} {item.satuan} terjual
                    </p>
                  </div>
                </div>
                {items.length > 1 && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full transition-all ${index === 0 ? "bg-yellow-500" : "bg-sage"}`}
                      style={{ width: `${(item.sales / items[0].sales) * 100}%` }}
                    />
                  </div>
                )}
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
          href="/dashboard/transaction"
          className="block text-center mt-4 text-sm text-cream underline hover:text-cream/60 transition"
        >
          Lihat semua transaksi
        </Link>
      )}
    </div>
  );
};

export default TopProductCard;