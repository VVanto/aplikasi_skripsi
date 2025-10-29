"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "../../loading";

const SingleProductPage = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    kate: "",
    deskrip: "",
    harga: "",
    stok: "",
    satuan: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`Gagal fetch produk: ${res.statusText}`);
        }
        const data = await res.json();
        setProduct(data);
        setFormData({
          name: data.name || "",
          kate: data.kate || "",
          deskrip: data.deskrip || "",
          harga: data.harga || "",
          stok: data.stok || "",
          satuan: data.satuan || "",
        });
      } catch (err) {
        console.log(err);
        setError(err.message);
      }
    };
    loadProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          harga: parseFloat(formData.harga), // Pastikan numerik
          stok: parseInt(formData.stok), // Pastikan numerik
        }),
      });
      if (res.ok) {
        alert("Produk berhasil diupdate!");
        router.push("/dashboard/products");
      } else {
        const errData = await res.json();
        alert(`Gagal update produk: ${errData.error || res.statusText}`);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!product)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input type="hidden" name="id" value={product.id} />
          <label>Nama Produk</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <label>Harga</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="harga"
            value={formData.harga}
            onChange={(e) =>
              setFormData({ ...formData, harga: e.target.value })
            }
            step="10000"
            min="0"
            required
          />
          <label>Stok</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="stok"
            value={formData.stok}
            onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
            min="0"
            required
          />
          <label>Kategori</label>
          <select
            name="kate"
            id="kate"
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
            value={formData.kate}
            onChange={(e) => setFormData({ ...formData, kate: e.target.value })}
            required
          >
            <option value="" disabled>
              Pilih Kategori
            </option>
            {[
              "Bahan Utama",
              "Cat & Pelapis",
              "Peralatan & Perkakas",
              "Sanitasi",
              "Kelistrikan",
              "Kayu & Logam",
              "Interior & Finishing",
              "Eksterior",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <label>Deskripsi</label>
          <textarea
            name="deskrip"
            id="deskrip"
            cols="30"
            rows="5"
            value={formData.deskrip}
            onChange={(e) =>
              setFormData({ ...formData, deskrip: e.target.value })
            }
            className="bg-transparent w-full border border-lightOlive p-7 rounded-lg mb-7"
          />
          <label>Satuan</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="satuan"
            value={formData.satuan}
            onChange={(e) =>
              setFormData({ ...formData, satuan: e.target.value })
            }
            placeholder="e.g., pcs, kg"
            required
          />
          <button className="w-full mt-5 p-5 cursor-pointer bg-sage rounded-lg">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;
