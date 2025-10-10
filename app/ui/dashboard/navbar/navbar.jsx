"use client";
import { Bodoni_Moda } from "next/font/google";
import { usePathname } from "next/navigation";
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";

const bodoni = Bodoni_Moda({
  weight: ["400"],
  subsets: ["latin"]

});

const Navbar = () => {
  const pathName = usePathname();

  return (
    <div className="flex p-5 content-center justify-between  bg-olive rounded-lg">
      <div className={`text-3xl ${bodoni.className} content-center justify-between text-cream capitalize`}>
        {pathName.split("/").pop()}
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 p-3 bg-darkOlive rounded-lg">
          <MdSearch />
          <input type="text" placeholder="Cari..." className="bg-transparent border-none" />
        </div>
        <div className="flex gap-5">
          <MdOutlineChat size={20} />
          <MdNotifications size={20} />
          <MdPublic size={20} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
