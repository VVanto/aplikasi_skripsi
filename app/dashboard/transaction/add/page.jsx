"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTransaksiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ tanggal: "" });
  const [items, setItems] = useState([
    { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=1000");
        if (!res.ok) throw new Error("Gagal fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    setTotalHarga(newTotal);
  }, [items]);

  const addItem = () => {
    setItems([
      ...items,
      { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setError("Minimal harus ada 1 item");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setError(null);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const oldBarangId = newItems[index].barangId;

    // Jika pilih barang yang sudah ada di item lain → merge jumlah
    if (field === "barangId" && value) {
      const existingIndex = newItems.findIndex(
        (item, i) => i !== index && item.barangId === value
      );

      if (existingIndex !== -1) {
        // Ambil jumlah lama + jumlah baru
        const oldJumlah = parseInt(newItems[existingIndex].jumlahBarang) || 0;
        const newJumlah = parseInt(newItems[index].jumlahBarang) || 0;
        const mergedJumlah = oldJumlah + newJumlah;

        const product = products.find((p) => p.id == value);
        if (product) {
          // Cek stok
          if (mergedJumlah > product.stok) {
            setError(
              `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Total diminta: ${mergedJumlah}`
            );
            return;
          }

          // Update item yang sudah ada
          newItems[existingIndex].jumlahBarang = mergedJumlah;
          newItems[existingIndex].subTotal = mergedJumlah * product.harga;

          // Hapus item yang sedang diedit (karena digabung)
          newItems.splice(index, 1);
          setItems(newItems);
          setError(null);
          return;
        }
      }
    }

    // Update normal
    newItems[index][field] = value;

    if (field === "barangId") {
      const selectedProduct = products.find((p) => p.id == value);
      if (selectedProduct) {
        newItems[index].hargaSatuan = selectedProduct.harga;
        const jumlah = parseInt(newItems[index].jumlahBarang) || 0;
        newItems[index].subTotal = jumlah * selectedProduct.harga;
      }
    }

    if (field === "jumlahBarang") {
      const jumlah = parseInt(value) || 0;
      const harga = parseFloat(newItems[index].hargaSatuan) || 0;
      newItems[index].subTotal = jumlah * harga;

      // Cek stok saat jumlah berubah
      const product = products.find((p) => p.id == newItems[index].barangId);
      if (product && jumlah > product.stok) {
        setError(
          `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Diminta: ${jumlah}`
        );
      } else {
        setError(null);
      }
    }

    setItems(newItems);
  };

  const validateStock = () => {
    for (const item of items) {
      const product = products.find((p) => p.id == item.barangId);
      if (!product) {
        setError("Produk tidak ditemukan");
        return false;
      }
      const jumlah = parseInt(item.jumlahBarang) || 0;
      if (jumlah > product.stok) {
        setError(
          `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Diminta: ${jumlah}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.tanggal) {
      setError("Tanggal harus diisi");
      return;
    }

    if (items.some((item) => !item.barangId || !item.jumlahBarang)) {
      setError("Semua item harus lengkap");
      return;
    }

    if (!validateStock()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          items: items.map((item) => ({
            barangId: parseInt(item.barangId),
            jumlahBarang: parseInt(item.jumlahBarang),
            hargaSatuan: parseFloat(item.hargaSatuan),
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Transaksi berhasil ditambahkan!");
        router.push("/dashboard/transaction");
        router.refresh();
      } else {
        setError(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Tambah Transaksi
        </h2>

        {error && (
          <div className="bg-red border border-red-500 text-red-200 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Tanggal & Waktu</label>
          <input
            type="datetime-local"
            value={formData.tanggal}
            onChange={(e) =>
              setFormData({ ...formData, tanggal: e.target.value })
            }
            className="bg-transparent border border-lightOlive p-3 rounded-lg w-full"
            required
          />
        </div>

        <h3 className="text-lg font-bold mb-4">Daftar Item</h3>

        {items.map((item, index) => {
          const selectedProduct = products.find((p) => p.id == item.barangId);

          return (
            <div
              key={index}
              className="border border-lightOlive p-5 rounded-lg mb-4 bg-olive/50"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg">Item #{index + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red hover:bg-red px-4 py-2 rounded-lg text-sm transition"
                  >
                    Hapus Item
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Pilih Barang
                  </label>
                  <select
                    value={item.barangId}
                    onChange={(e) =>
                      updateItem(index, "barangId", e.target.value)
                    }
                    className="bg-transparent border border-lightOlive p-3 rounded-lg w-full text-sm"
                    required
                  >
                    <option value="" disabled>
                      -- Pilih Barang --
                    </option>
                    {products.map((product) => {
                      const isSelected = items.some(
                        (it, i) => i !== index && it.barangId == product.id
                      );
                      return (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={isSelected}
                          className={isSelected ? "text-gray-500" : "bg-olive"}
                        >
                          {product.name} - Stok: {product.stok} (
                          {product.satuan})
                          {isSelected ? " (sudah dipilih)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {selectedProduct && (
                    <p className="text-xs text-cream/70 mt-1">
                      Harga: Rp{" "}
                      {Number(selectedProduct.harga).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.jumlahBarang}
                    onChange={(e) =>
                      updateItem(index, "jumlahBarang", e.target.value)
                    }
                    className="bg-transparent border border-lightOlive p-3 rounded-lg w-full"
                    required
                    min="1"
                    max={selectedProduct ? selectedProduct.stok : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm">Harga Satuan</label>
                  <input
                    type="text"
                    value={
                      item.hargaSatuan
                        ? `Rp ${Number(item.hargaSatuan).toLocaleString(
                            "id-ID"
                          )}`
                        : "Rp 0"
                    }
                    className="bg-gray-700 border border-lightOlive p-3 rounded-lg w-full cursor-not-allowed text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Sub Total</label>
                  <input
                    type="text"
                    value={`Rp ${Number(item.subTotal).toLocaleString(
                      "id-ID"
                    )}`}
                    className="bg-gray-700 border border-lightOlive p-3 rounded-lg w-full cursor-not-allowed text-sm"
                    readOnly
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="bg-blue-900 hover:bg-blue-800 p-3 rounded-lg mb-4 font-medium transition"
        >
          + Tambah Item Baru
        </button>

        <div className=" p-5 rounded-lg mb-6 text-left">
          <p className="text-2xl font-bold">
            Total Harga: Rp {Number(totalHarga).toLocaleString("id-ID")}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full p-4 bg-sage hover:bg-sage/80 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </form>
    </div>
  );
}
