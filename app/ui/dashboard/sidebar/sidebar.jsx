"use client";

import {
  MdAnalytics,
  MdAttachMoney,
  MdDashboard,
  MdHelpCenter,
  MdLogout,
  MdOutlineSettings,
  MdPeople,
  MdShoppingBag,
  MdSupervisedUserCircle,
  MdWork,
} from "react-icons/md";
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    titles: "Pages",
    list: [
      { title: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Products",
        path: "/dashboard/products",
        icon: <MdShoppingBag />,
      },
      {
        title: "Transactions",
        path: "/dashboard/transaction",
        icon: <MdAttachMoney />,
      },
    ],
  },
  {
    titles: "Analytics",
    list: [
      { title: "Revenue", path: "/dashboard/revenue", icon: <MdWork /> },
      { title: "Reports", path: "/dashboard/reports", icon: <MdAnalytics /> },
      { title: "Teams", path: "/dashboard/teams", icon: <MdPeople /> },
    ],
  },
  {
    titles: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      { title: "Help", path: "/dashboard/help", icon: <MdHelpCenter /> },
    ],
  },
];

const Sidebar = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push("/login");
      } else {
        alert("Gagal logout. Coba lagi.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-10 w-full">
      <div className="flex items-center gap-5 mb-5">
        <Image
          src="/noavatar.png"
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-medium text-white">Wanto</span>
          <span className="text-sm text-cream">Administrator</span>
        </div>
      </div>

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
        <li></li>
      </ul>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-5 py-3 my-2 flex items-center gap-2 hover:bg-lightOlive rounded-lg transition-all"
      >
        {loading ? <div className="loader w-4 h-4"></div> : <MdLogout />}
        <span>{loading ? "Memuat..." : "Logout"}</span>
      </button>
    </div>
  );
};

export default Sidebar;
