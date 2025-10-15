import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Image from "next/image";
import Link from "next/link";

const Products = () => {
  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Barang..." />

        <Link href="/dashboard/products/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
            Tambahkan
          </button>
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="p-3">
            <td>Nama Barang</td>
            <td>Deskripsi</td>
            <td>Harga</td>
            <td>Dibuat pada</td>
            <td>Stok</td>
            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          <tr className="p-3">
            <td className="flex items-center gap-3">
              <Image
                src="/noavatar.png"
                alt=""
                width={40}
                height={40}
                className="object-cover rounded-md"
              />
              Semen
            </td>
            <td>Ini adalah semen</td>
            <td>2.000.000</td>
            <td>23.09.2025</td>
            <td>Admin</td>

            <td>
              <Link href="/">
                <button className="bg-blue-900 py-1 px-3 rounded-lg border-none cursor-pointer mr-2">
                  Lihat
                </button>
              </Link>
              <button className="bg-red-800 py-1 px-3 rounded-lg border-none cursor-pointer">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination />
    </div>
  );
};

export default Products;
