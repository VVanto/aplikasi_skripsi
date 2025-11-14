"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";

export default function AddTransaksiPage() {
  const router = useRouter();
  const { success, error } = useAlert();

  const [formData, setFormData] = useState({ tanggal: "" });
  const [items, setItems] = useState([
    { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();

    // ---- CARA OTOMATIS ----
    const offsetMs = now.getTimezoneOffset() * 60_000;    // offset dalam ms (negatif untuk +zone)
    const localTime = new Date(now.getTime() - offsetMs); // konversi ke lokal
    const formatted = localTime.toISOString().slice(0, 16);
    setFormData({ tanggal: formatted });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=1000");
        if (!res.ok) throw new Error("Gagal fetch produk");
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        error(err.message);
      }
    };
    fetchProducts();
  }, [error]);

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
      error("Minimal harus ada 1 item");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];

    if (field === "barangId" && value) {
      const existingIndex = newItems.findIndex(
        (item, i) => i !== index && item.barangId === value
      );

      if (existingIndex !== -1) {
        const oldJumlah = parseInt(newItems[existingIndex].jumlahBarang) || 0;
        const newJumlah = parseInt(newItems[index].jumlahBarang) || 0;
        const mergedJumlah = oldJumlah + newJumlah;

        const product = products.find((p) => p.id == value);
        if (product && mergedJumlah > product.stok) {
          error(
            `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Total: ${mergedJumlah}`
          );
          return;
        }

        newItems[existingIndex].jumlahBarang = mergedJumlah;
        newItems[existingIndex].subTotal = mergedJumlah * product.harga;
        newItems.splice(index, 1);
        setItems(newItems);
        return;
      }
    }

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

      const product = products.find((p) => p.id == newItems[index].barangId);
      if (product && jumlah > product.stok) {
        error(
          `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Diminta: ${jumlah}`
        );
      }
    }

    setItems(newItems);
  };

  const validateStock = () => {
    for (const item of items) {
      const product = products.find((p) => p.id == item.barangId);
      if (!product) {
        error("Produk tidak ditemukan");
        return false;
      }
      const jumlah = parseInt(item.jumlahBarang) || 0;
      if (jumlah > product.stok) {
        error(
          `Stok ${product.name} tidak cukup. Tersedia: ${product.stok}, Diminta: ${jumlah}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tanggal) {
      error("Tanggal harus diisi");
      return;
    }

    if (items.some((item) => !item.barangId || !item.jumlahBarang)) {
      error("Semua item harus lengkap");
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
        success("Transaksi berhasil ditambahkan!");
        router.push("/dashboard/transaction");
        router.refresh();
      } else {
        error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (err) {
      error("Koneksi gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center text-cream">
          Tambah Transaksi
        </h2>

        {/* TANGGAL */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold bg-olive text-cream">
            Tanggal & Waktu
          </label>
          <input
            type="datetime-local"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            className="bg-transparent  p-3 rounded-lg w-full text-cream "
            disabled
          />
        </div>

        <h3 className="text-lg font-bold mb-4 text-cream">Daftar Item</h3>

        {items.map((item, index) => {
          const selectedProduct = products.find((p) => p.id == item.barangId);

          return (
            <div
              key={index}
              className="border border-lightOlive p-5 rounded-lg mb-4 bg-olive/50"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg text-cream">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red hover:bg-red/80 px-4 py-2 rounded-lg text-sm transition text-cream"
                  >
                    Hapus Item
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-cream">Pilih Barang</label>
                  <select
                    value={item.barangId}
                    onChange={(e) => updateItem(index, "barangId", e.target.value)}
                    className="bg-transparent border border-lightOlive p-3 rounded-lg w-full text-sm text-cream focus:border-sage focus:outline-none transition"
                    required
                  >
                    <option value="" disabled>-- Pilih Barang --</option>
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
                          {product.name} - Stok: {product.stok} ({product.satuan})
                          {isSelected ? " (dipilih)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {selectedProduct && (
                    <p className="text-xs text-cream/70 mt-1">
                      Harga: Rp {Number(selectedProduct.harga).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-cream">Jumlah</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.jumlahBarang}
                    onChange={(e) => updateItem(index, "jumlahBarang", e.target.value)}
                    className="bg-transparent border border-lightOlive p-3 rounded-lg w-full text-cream focus:border-sage focus:outline-none transition"
                    required
                    min="1"
                    max={selectedProduct?.stok}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-xs text-cream/80">Harga Satuan</label>
                  <input
                    type="text"
                    value={item.hargaSatuan ? `Rp ${Number(item.hargaSatuan).toLocaleString("id-ID")}` : "Rp 0"}
                    className="bg-gray-700 border border-lightOlive p-3 rounded-lg w-full text-sm cursor-not-allowed text-cream/70"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-cream/80">Sub Total</label>
                  <input
                    type="text"
                    value={`Rp ${Number(item.subTotal).toLocaleString("id-ID")}`}
                    className="bg-gray-700 border border-lightOlive p-3 rounded-lg w-full text-sm cursor-not-allowed text-cream/70"
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
          className="bg-blue hover:bg-blue/80 p-3 rounded-lg mb-4 font-medium transition text-cream"
        >
          + Tambah Item Baru
        </button>

        <div className="bg-olive/50 p-5 rounded-lg mb-6 text-left">
          <p className="text-2xl font-bold text-cream">
            Total Harga: Rp {Number(totalHarga).toLocaleString("id-ID")}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-sage hover:bg-sage/80 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed "
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </form>
    </div>
  );
}