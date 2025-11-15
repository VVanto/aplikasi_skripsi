"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";

const AddProductPage = () => {
  const router = useRouter();
  const { success, error } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    kate: "",
    desc: "",
    harga: "",
    stok: "",
    satuan: "",
    stok_maksimal: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error("Ukuran file maksimal 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      error("File harus berupa gambar");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let gambarUrl = null;
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataImage,
        });

        if (!uploadRes.ok) throw new Error("Gagal upload gambar");
        const uploadData = await uploadRes.json();
        gambarUrl = uploadData.url;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          harga: parseFloat(formData.harga) || 0,
          stok: parseInt(formData.stok) || 0,
          stok_maksimal: parseInt(formData.stok_maksimal) || 100,
          gambar: gambarUrl,
        }),
      });

      if (res.ok) {
        success("Produk berhasil ditambahkan!");
        setFormData({
          name: "",
          kate: "",
          desc: "",
          harga: "",
          stok: "",
          satuan: "",
          stok_maksimal: "",
        });
        setImageFile(null);
        setImagePreview(null);
        router.push("/dashboard/products");
      } else {
        const errData = await res.json();
        error(errData.error || "Gagal menambahkan produk");
      }
    } catch (err) {
      error("Error: " + err.message);
    } finally {
      setUploading(false);
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
          <option value="" className="bg-olive" disabled>
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
          ].map((cat) => (
            <option className="bg-olive" key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stok Awal"
          value={formData.stok}
          onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          min="0"
        />
        <input
          type="number"
          placeholder="Stok Maksimal (untuk peringatan)"
          value={formData.stok_maksimal}
          onChange={(e) =>
            setFormData({ ...formData, stok_maksimal: e.target.value })
          }
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          min="1"
        />

        <input
          type="number"
          placeholder="Harga"
          value={formData.harga}
          onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          min="0"
          step="1000"
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

        {/* Upload Gambar */}
        <div className="w-full mb-7">
          <label className="block mb-2 text-sm font-medium">
            Gambar Produk (opsional, max 5MB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm border border-lightOlive rounded-lg cursor-pointer bg-transparent p-2"
          />

          {imagePreview && (
            <div className="mt-4 relative w-32 h-32">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Mengupload..." : "Tambah Produk"}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
