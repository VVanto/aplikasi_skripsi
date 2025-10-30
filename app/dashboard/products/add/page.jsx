"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AddProductPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    kate: "",
    desc: "",
    harga: "",
    stok: "",
    satuan: "",
    stok_maksimal: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          harga: parseFloat(formData.harga) || 0,
          stok: parseInt(formData.stok) || 0,
          stok_maksimal: parseInt(formData.stok_maksimal) || 100,
        }),
      });
      if (res.ok) {
        alert("Produk berhasil ditambahkan!");
        setFormData({
          name: "", kate: "", desc: "", harga: "", stok: "", satuan: "", stok_maksimal: ""
        });
        router.push("/dashboard/products");
      } else {
        const errData = await res.json();
        alert(`Gagal: ${errData.error || res.statusText}`);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap justify-between">
        <input
          type="text"
          placeholder="Nama Produk"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-transparent w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
        />
        <select
          value={formData.kate}
          onChange={(e) => setFormData({ ...formData, kate: e.target.value })}
          className="bg-transparent w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
        >
          <option value="" disabled>Pilih Kategori</option>
          {["Bahan Utama", "Cat & Pelapis", "Peralatan & Perkakas", "Sanitasi", "Kelistrikan", "Kayu & Logam", "Interior & Finishing", "Eksterior"].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stok Awal"
          value={formData.stok}
          onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required min="0"
        />
        <input
          type="number"
          placeholder="Stok Maksimal (untuk peringatan)"
          value={formData.stok_maksimal}
          onChange={(e) => setFormData({ ...formData, stok_maksimal: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required min="1"
        />

        <input
          type="number"
          placeholder="Harga"
          value={formData.harga}
          onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required min="0" step="1000"
        />
        <input
          type="text"
          placeholder="Satuan (pcs, kg, batang)"
          value={formData.satuan}
          onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
        />

        <textarea
          placeholder="Deskripsi (opsional)"
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          className="bg-transparent w-full border border-lightOlive p-7 rounded-lg mb-7"
          rows="4"
        />

        <button className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none font-bold">
          Tambah Produk
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;