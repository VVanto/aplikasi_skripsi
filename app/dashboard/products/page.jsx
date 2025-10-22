import { deleteProduct } from "@/app/lib/action";
import { fetchProducts } from "@/app/lib/data";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import Image from "next/image";
import Link from "next/link";

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const { count, product } = await fetchProducts(q, page);

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Search placeholder="Cari Produk..." />

        <Link href="/dashboard/products/add">
          <button className="bg-sage p-2 border-none rounded-lg cursor-pointer">
            Tambahkan
          </button>
        </Link>
      </div>
      <table className="w-full">
        <thead>
          <tr className="p-3">
            <td>Nama Produk</td>
            <td>Kategori</td>
            <td>Deskripsi</td>
            <td>Harga</td>
            <td>Dibuat pada</td>
            <td>Stok</td>

            <td>Tindakan</td>
          </tr>
        </thead>
        <tbody>
          {product.map((product) => (
            <tr key={product.id} className="p-3">
              <td>
                <div className="flex items-center gap-3">
                  <Image
                    src="/noavatar.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                  {product.name}
                </div>
              </td>
              <td>{product.kate}</td>
              <td>{product.deskrip}</td>
              <td>Rp {product.harga}</td>
              <td>{product.createdAt?.toString().slice(4, 25)}</td>
              <td>
                {product.stok} {product.satuan}
              </td>

              <td>
                <Link href={`/dashboard/products/${product.id}`}>
                  <button className="bg-blue-900 py-1 px-3 rounded-lg border-none cursor-pointer mr-2">
                    Lihat
                  </button>
                </Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={product.id}/>
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

export default ProductsPage;
