import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";

const UsersPage = () => {
  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Pengguna..." />

        <Link href="/dashboard/users/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
            Tambahkan
          </button>
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="p-3">
            <td>Nama</td>
            <td>Email</td>
            <td>Dibuat pada</td>
            <td>Role</td>
            <td>Status Akun</td>
            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          <tr className="p-3">
            <td>Nico Wanto</td>
            <td>wanto@mail.com</td>
            <td>23.09.2025</td>
            <td>Admin</td>
            <td>Active</td>

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

export default UsersPage;
