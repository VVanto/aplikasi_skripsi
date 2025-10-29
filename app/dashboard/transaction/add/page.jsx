"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTransaksiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tanggal: "",
  });
  const [items, setItems] = useState([
    { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 }
  ]);
  const [products, setProducts] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=1000");
        if (!res.ok) {
          throw new Error("Gagal fetch products");
        }
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  // Update total harga otomatis
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    setTotalHarga(newTotal);
  }, [items]);

  const addItem = () => {
    setItems([
      ...items,
      { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 }
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
    newItems[index][field] = value;

    if (field === "barangId") {
      // Auto-fill harga satuan dari produk yang dipilih (READ-ONLY)
      const selectedProduct = products.find((p) => p.id == value);
      if (selectedProduct) {
        newItems[index].hargaSatuan = selectedProduct.harga;
        // Hitung subtotal jika jumlah sudah diisi
        const jumlah = parseInt(newItems[index].jumlahBarang) || 0;
        newItems[index].subTotal = jumlah * selectedProduct.harga;
      }
    }

    if (field === "jumlahBarang") {
      // Hitung subtotal otomatis saat jumlah berubah
      const jumlah = parseInt(value) || 0;
      const harga = parseFloat(newItems[index].hargaSatuan) || 0;
      newItems[index].subTotal = jumlah * harga;
    }

    setItems(newItems);
  };

  const validateStock = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = products.find((p) => p.id == item.barangId);
      
      if (!product) {
        setError(`Item ${i + 1}: Produk tidak ditemukan`);
        return false;
      }

      const jumlah = parseInt(item.jumlahBarang) || 0;
      if (jumlah > product.stok) {
        setError(
          `Item ${i + 1} (${product.name}): Stok tidak mencukupi. Tersedia: ${product.stok}, Diminta: ${jumlah}`
        );
        return false;
      }

      if (jumlah <= 0) {
        setError(`Item ${i + 1}: Jumlah barang harus lebih dari 0`);
        return false;
      }

      if (!item.hargaSatuan || parseFloat(item.hargaSatuan) <= 0) {
        setError(`Item ${i + 1}: Harga satuan tidak valid`);
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

    if (items.some((item) => !item.barangId || !item.jumlahBarang || !item.hargaSatuan)) {
      setError("Semua item harus lengkap (barang dan jumlah)");
      return;
    }

    if (!validateStock()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          items: items.map(item => ({
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
      console.error("Submit error:", error);
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">Tambah Transaksi</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <label className="mb-2 font-semibold">Tanggal & Waktu Transaksi</label>
        <input
          type="datetime-local"
          name="tanggal"
          value={formData.tanggal}
          onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          className="bg-transparent border border-lightOlive p-3 rounded-lg mb-4"
          required
        />

        <h3 className="text-lg font-bold mb-2">Daftar Item</h3>
        
        {items.map((item, index) => {
          const selectedProduct = products.find((p) => p.id == item.barangId);
          
          return (
            <div
              key={index}
              className="flex flex-col gap-3 mb-4 border border-lightOlive p-4 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Item #{index + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg  text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Pilih Barang */}
              <div>
                <label className="block mb-1 text-sm">Pilih Barang</label>
                <select
                  name="barangId"
                  value={item.barangId}
                  onChange={(e) => updateItem(index, "barangId", e.target.value)}
                  className="bg-transparent w-full border border-lightOlive p-3 rounded-lg "
                  required
                >
                  <option value="" disabled className="bg-olive">
                    -- Pilih Barang --
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-olive">
                      {product.name} - Stok: {product.stok} (Rp{" "}
                      {Number(product.harga).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="text-sm text-gray-300 mt-1">
                    Stok tersedia: <span className="font-bold">{selectedProduct.stok}</span>{" "}
                    {selectedProduct.satuan}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Jumlah Barang */}
                <div>
                  <label className="block mb-1 text-sm">Jumlah</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.jumlahBarang}
                    onChange={(e) => updateItem(index, "jumlahBarang", e.target.value)}
                    className="bg-transparent w-full border border-lightOlive p-3 rounded-lg "
                    required
                    min="1"
                    max={selectedProduct ? selectedProduct.stok : undefined}
                  />
                </div>

                {/* ✅ Harga Satuan (READ-ONLY, tidak bisa diubah) */}
                <div>
                  <label className="block mb-1 text-sm">Harga Satuan</label>
                  <input
                    type="text"
                    value={item.hargaSatuan ? `Rp ${Number(item.hargaSatuan).toLocaleString("id-ID")}` : "Rp 0"}
                    className="bg-gray-700 w-full border border-lightOlive p-3 rounded-lg  cursor-not-allowed"
                    readOnly
                  />
                </div>

                {/* ✅ Sub Total (READ-ONLY, auto-calculate) */}
                <div>
                  <label className="block mb-1 text-sm">Sub Total</label>
                  <input
                    type="text"
                    value={`Rp ${Number(item.subTotal).toLocaleString("id-ID")}`}
                    className="bg-gray-700 w-full border border-lightOlive p-3 rounded-lg cursor-not-allowed"
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
          className="bg-blue-900 hover:bg-blue-800 p-3 rounded-lg  mb-4"
        >
          + Tambah Item
        </button>

        {/* Total Harga */}
        <div className="bg-sage/30 border border-sage p-4 rounded-lg mb-4">
          <p className="text-2xl font-bold">
            Total Harga: Rp {Number(totalHarga).toLocaleString("id-ID")}
          </p>
        </div>

        {/* Submit Button */}
        <button
          className="w-full p-4 bg-sage hover:bg-sage/80 rounded-lg cursor-pointer border-none  font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </form>
    </div>
  );
}