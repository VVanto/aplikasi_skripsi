"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "../../loading";

const SingleProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    stok: "",
    deskrip: "",
    harga: "",
    stok_maksimal: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

 
  const loadProduct = async () => {
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
      alert(err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.stok < 0) {
      alert("Stok tidak boleh negatif");
      return;
    }
    if (form.harga < 0) {
      alert("Harga tidak boleh negatif");
      return;
    }
    if (form.stok_maksimal <= 0) {
      alert("Stok maksimal harus > 0");
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
        alert("Produk berhasil diupdate!");
        await loadProduct(); // Reload data
      } else {
        const err = await res.json();
        alert(err.error || "Gagal update");
      }
    } catch (error) {
      alert("Error: " + error.message);
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
        <h2 className="text-3xl font-bold text-cream">{product.name}</h2>
        <div className="grid grid-cols-2 gap-4 text-xl">
          <div>
            <p className="text-cream/70">Kategori</p>
            <p className="font-semibold">{product.kate}</p>
          </div>
          <div>
            <p className="text-cream/70">Satuan</p>
            <p className="font-semibold">{product.satuan}</p>
          </div>
        </div>


        <div className="mt-6">
          <p className="text-cream/70 text-sm mb-1">Persentase Stok</p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                percentage < 10 ? "bg-red-500" : "bg-sage"
              }`}
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
              onChange={(e) =>
                setForm({ ...form, stok_maksimal: e.target.value })
              }
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
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg  focus:outline-none focus:border-sage"
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
              className="w-full p-3 bg-transparent border border-lightOlive rounded-lg  resize-none focus:outline-none focus:border-sage"
              rows="4"
              placeholder="Opsional..."
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-sage hover:bg-sage/80 disabled:bg-gray-600 rounded-lg font-bold  transition disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;
