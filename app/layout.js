import { Figtree } from "next/font/google";

import "./ui/globals.css";

const mainFont = Figtree({
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Aplikasi Skripsi Nico Suwanto",
  description: "Aplikasi Dashboard Manajemen Stok Nico Suwanto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${mainFont.className} antialiased`}>{children}</body>
    </html>
  );
}
