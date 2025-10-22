import { deleteUser } from "@/app/lib/action";
import { fetchUsers } from "@/app/lib/data";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Link from "next/link";

const UsersPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, users } = await fetchUsers(q, page);

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Username..." />

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
            <td>Username</td>
            <td>Dibuat pada</td>
            <td>Role</td>

            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="p-3">
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.createdAt?.toString().slice(4, 25)}</td>
              <td>{user.role ? "Admin" : "Staf"}</td>

              <td>
                <Link href={`/dashboard/users/${user.id}`}>
                  <button className="bg-blue-900 py-1 px-3 rounded-lg border-none cursor-pointer mr-2">
                    Lihat
                  </button>
                </Link>
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={(user.id)} />
                  <button className="bg-red-800 py-1 px-3 rounded-lg border-none cursor-pointer">
                    Hapus
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
};

export default UsersPage;
