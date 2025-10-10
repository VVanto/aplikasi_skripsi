"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MenuLink = ({ item }) => {
  const pathName = usePathname();

  return (
    <Link
      href={item.path}
      className={`px-8 py-3 my-2 flex items-center gap-2 hover:bg-lightOlive rounded-lg 
        ${pathName === item.path ? "bg-darkOlive" : ""}`}
    >
      {item.icon}
      {item.title}
    </Link>
  );
};

export default MenuLink;
