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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          harga: parseFloat(formData.harga) || 0, // Pastikan numerik
          stok: parseInt(formData.stok) || 0, // Pastikan numerik
        }),
      });
      if (res.ok) {
        alert("Produk berhasil ditambahkan!");
        setFormData({
          name: "",
          kate: "",
          desc: "",
          harga: "",
          stok: "",
          satuan: "",
        });
        router.push("/dashboard/products");
      } else {
        const errData = await res.json();
        alert(`Gagal menambahkan produk: ${errData.error || res.statusText}`);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap justify-between">
        <input
          type="text"
          placeholder="Nama Produk"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-transparent w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
        />
        <select
          name="kate"
          id="kate"
          value={formData.kate}
          onChange={(e) => setFormData({ ...formData, kate: e.target.value })}
          className="bg-transparent w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
        >
          <option value="" disabled>
            Pilih Kategori
          </option>
          <option value="Bahan Utama">Bahan Utama</option>
          <option value="Cat & Pelapis">Cat & Pelapis</option>
          <option value="Peralatan & Perkakas">Peralatan & Perkakas</option>
          <option value="Sanitasi">Sanitasi</option>
          <option value="Kelistrikan">Kelistrikan</option>
          <option value="Kayu & Logam">Kayu & Logam</option>
          <option value="Interior & Finishing">Interior & Finishing</option>
          <option value="Eksterior">Eksterior</option>
        </select>
        <input
          type="number"
          placeholder="Stok"
          name="stok"
          value={formData.stok}
          onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          min="0"
        />
        <input
          type="text"
          placeholder="Satuan"
          name="satuan"
          value={formData.satuan}
          onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
        />
        <input
          type="number"
          placeholder="Harga"
          name="harga"
          value={formData.harga}
          onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          min="0"
          step="10000"
        />
        <textarea
          name="desc"
          id="desc"
          cols="30"
          rows="5"
          placeholder="Deskripsi"
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          className="bg-transparent w-full border border-lightOlive p-7 rounded-lg mb-7"
        />
        <button
          className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
