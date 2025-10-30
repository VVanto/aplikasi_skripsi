"use client";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathName = usePathname();

  return (
    <div className="flex p-5 content-center justify-between  bg-olive rounded-lg">
      <div className="text-3xl content-center justify-between text-cream capitalize">
        {pathName.split("/").pop()}
      </div>
    </div>
  );
};

export default Navbar;
