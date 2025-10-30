"use client";

import {
  MdAttachMoney,
  MdDashboard,
  MdHistory,
  MdLogout,
  MdShoppingBag,
  MdSupervisedUserCircle,
} from "react-icons/md";
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/dashboard/loading";

const menuItems = [
  {
    titles: "Pages",
    list: [
      { title: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
      {
        title: "Pengguna",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Produk",
        path: "/dashboard/products",
        icon: <MdShoppingBag />,
      },
      {
        title: "Transaksi",
        path: "/dashboard/transaction",
        icon: <MdAttachMoney />,
      },
         {
        title: "Log Aktivitas",
        path: "/dashboard/log",
        icon: <MdHistory/>,
      },
    ],
  },
];

const Sidebar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const getRoleName = (role) => {
    if (role === 1 || role === "1") return "Administrator";
    if (role === 0 || role === "0") return "Staf";
    return "User";
  };

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/login");
    } catch {
      alert("Gagal logout");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <Loading />
      </div>
    );
  }

  return (
    <div className="sticky top-5 h-[calc(100vh-2.5rem)] flex flex-col justify-between">
 
      <div>
  
        <div className="flex items-center gap-5 mb-5">
          <Image
            src="/noavatar.png"
            alt="Avatar"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium">{user?.username || "User"}</span>
            <span className="text-sm text-cream">
              {getRoleName(user?.role)}
            </span>
          </div>
        </div>

        {/* MENU */}
        <ul className="list-none">
          {menuItems.map((cat) => (
            <li key={cat.titles}>
              <span className="text-cream text-lg font-semibold my-3 block">
                {cat.titles}
              </span>
              {cat.list.map((item) => (
                <MenuLink item={item} key={item.title} />
              ))}
            </li>
          ))}
        </ul>
      </div>

      {/* BAGIAN BAWAH */}
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="px-5 py-3 flex items-center gap-2 hover:bg-lightOlive rounded-lg transition-all disabled:opacity-50"
      >
        {logoutLoading ? <div className="loader w-4 h-4"></div> : <MdLogout />}
        <span>{logoutLoading ? "Memuat..." : "Logout"}</span>
      </button>
    </div>
  );
};

export default Sidebar;
