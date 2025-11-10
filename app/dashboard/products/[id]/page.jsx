"use client";

import { useEffect, useState, useCallback } from "react"; // tambahkan useCallback
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Loading from "../../loading";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";

const SingleProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { success, error } = useAlert();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    stok: "",
    deskrip: "",
    harga: "",
    stok_maksimal: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


  const loadProduct = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat produk");
      const data = await res.json();
      setProduct(data);
      setForm({
        stok: data.stok ?? 0,
        deskrip: data.deskrip ?? "",
        harga: data.harga ?? 0,
        stok_maksimal: data.stok_maksimal ?? 100,
      });
    } catch (err) {
      error(err.message);
    } finally {
      setFetching(false);
    }
  }, [id]); 

  useEffect(() => {
    loadProduct();
  }, []); 

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.stok < 0) {
      error("Stok tidak boleh negatif");
      return;
    }
    if (form.harga < 0) {
      error("Harga tidak boleh negatif");
      return;
    }
    if (form.stok_maksimal <= 0) {
      error("Stok maksimal harus > 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stok: parseInt(form.stok),
          deskrip: form.deskrip || null,
          harga: parseFloat(form.harga),
          stok_maksimal: parseInt(form.stok_maksimal),
        }),
      });

      if (res.ok) {
        success("Produk berhasil diupdate!");
        router.push("/dashboard/products");
      } else {
        const err = await res.json();
        error(err.error || "Gagal update");
      }
    } catch (err) {
      error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading />;
  if (!product)
    return (
      <div className="text-center p-10 text-red-400">
        Produk tidak ditemukan
      </div>
    );

  const percentage = Math.round((form.stok / form.stok_maksimal) * 100);

  return (
    <div className="flex gap-6 mt-5">
      <div className="flex-1 bg-olive p-6 rounded-lg space-y-4">
        <div className="w-full h-[500px] bg-lightOlive rounded-lg overflow-hidden flex items-center justify-center">
          {product.gambar ? (
            <Image
              src={product.gambar}
              alt={product.name}
              width={500}
              height={500}
              className="object-cover w-full h-full"
              priority
     
            />
          ) : (
            <div className="text-center text-cream/50">
              <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Tidak ada gambar</p>
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-cream">{product.name}</h2>
        <div className="grid grid-cols-2 gap-4 text-xl">
          <div><p className="text-cream/70">Kategori</p><p className="font-semibold">{product.kate}</p></div>
          <div><p className="text-cream/70">Satuan</p><p className="font-semibold">{product.satuan}</p></div>
        </div>

        <div className="mt-6">
          <p className="text-cream/70 text-sm mb-1">Persentase Stok</p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${percentage < 10 ? "bg-red-500" : "bg-sage"}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-md text-cream/60 mt-1 text-right">
            {percentage}% tersisa ({form.stok} / {form.stok_maksimal})
          </p>
        </div>
      </div>

      <div className="flex-1 bg-olive p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-cream">Edit Produk</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-cream/80 mb-1">Stok Saat Ini</label>
            <input
              type="number"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: e.target.value })}
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg text-cream focus:outline-none focus:border-sage"
              min="0"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-cream/80 mb-1">Stok Maksimal</label>
            <input
              type="number"
              value={form.stok_maksimal}
              onChange={(e) => setForm({ ...form, stok_maksimal: e.target.value })}
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg text-cream focus:outline-none focus:border-sage"
              min="1"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-cream/80 mb-1">Harga (Rp)</label>
            <input
              type="number"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg text-cream focus:outline-none focus:border-sage"
              min="0"
              step="1000"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-cream/80 mb-1">Deskripsi</label>
            <textarea
              value={form.deskrip}
              onChange={(e) => setForm({ ...form, deskrip: e.target.value })}
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg resize-none focus:outline-none focus:border-sage"
              rows="4"
              placeholder="Opsional..."
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-sage hover:bg-sage/80 disabled:bg-gray-600 rounded-lg font-bold transition disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;