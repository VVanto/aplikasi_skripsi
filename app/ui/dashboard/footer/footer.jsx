"use client";

import Link from "next/link";
import { MdCopyright } from "react-icons/md";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 right-0 w-[1300px] bg-olive text-cream py-4 px-6 shadow-lg rounded-t-lg z-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        {/* Left */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <p className="flex items-center justify-center md:justify-start gap-1">
            <MdCopyright /> {currentYear} Dashboard Skripsi Nico Suwanto.
          </p>
        </div>

   
        <div className="text-center md:text-right">
          <Link href="https://wa.me/+6281323339006" className="hover:text-sage transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
