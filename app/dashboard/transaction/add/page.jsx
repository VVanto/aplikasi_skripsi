"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTransaksiPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tanggal: "",
  });
  const [items, setItems] = useState([{ barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 }]); // List item dynamic
  const [products, setProducts] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [error, setError] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Gagal fetch products");
        }
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : data || []);
      } catch (err) {
        console.log(err);
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  // Update totalHarga saat items berubah
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalHarga(newTotal);
  }, [items]);

  // Tambah item baru
  const addItem = () => {
    setItems([...items, { barangId: "", jumlahBarang: "", hargaSatuan: "", subTotal: 0 }]);
  };

  // Hapus item
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Update item field
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === "barangId") {
      // Auto set hargaSatuan dari products
      const selectedProduct = products.find((p) => p.id == value);
      if (selectedProduct) {
        newItems[index].hargaSatuan = selectedProduct.harga.toString();
      }
    }
    // Hitung subTotal jika jumlahBarang atau hargaSatuan berubah
    if (field === "jumlahBarang" || field === "hargaSatuan") {
      const jumlah = parseInt(newItems[index].jumlahBarang) || 0;
      const harga = parseFloat(newItems[index].hargaSatuan) || 0;
      newItems[index].subTotal = jumlah * harga;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some((item) => !item.barangId || !item.jumlahBarang || !item.hargaSatuan)) {
      setError("Semua item harus lengkap");
      return;
    }
    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          items,
        }),
      });
      if (res.ok) {
        alert("Transaksi berhasil ditambahkan!");
        router.push("/dashboard/transaction");
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      console.log(error);
      setError("Error: " + error.message);
    }
  };

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">Tambah Transaksi</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="datetime-local"
          name="tanggal"
          value={formData.tanggal}
          onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
          className="bg-transparent border border-lightOlive p-5 rounded-lg mb-4"
          required
        />

        <h3 className="text-lg font-bold mb-2">List Item</h3>
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap justify-between mb-4 border border-lightOlive p-4 rounded-lg">
            <select
              name="barangId"
              value={item.barangId}
              onChange={(e) => updateItem(index, "barangId", e.target.value)}
              className="bg-transparent w-[30%] border border-lightOlive p-3 rounded-lg mr-2"
              required
            >
              <option value="" disabled>
                Pilih Barang
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Rp {Number(product.harga).toLocaleString("id-ID")})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Jumlah Barang"
              value={item.jumlahBarang}
              onChange={(e) => updateItem(index, "jumlahBarang", e.target.value)}
              className="bg-transparent w-[20%] border border-lightOlive p-3 rounded-lg mr-2"
              required
              min="1"
            />
            <input
              type="number"
              placeholder="Harga Satuan"
              value={item.hargaSatuan}
              onChange={(e) => updateItem(index, "hargaSatuan", e.target.value)}
              className="bg-transparent w-[20%] border border-lightOlive p-3 rounded-lg mr-2"
              required
              min="0"
              step="10000"
            />
            <input
              type="text"
              placeholder="Sub Total"
              value={`Rp ${Number(item.subTotal).toLocaleString("id-ID")}`}
              className="bg-transparent w-[20%] border border-lightOlive p-3 rounded-lg mr-2"
              readOnly
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-800 p-2 rounded-lg cursor-pointer text-white"
            >
              Hapus Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-900 p-2 rounded-lg cursor-pointer mb-4 text-white"
        >
          Tambah Item
        </button>

        <p className="text-lg font-bold mb-4">Total Harga: Rp {Number(totalHarga).toLocaleString("id-ID")}</p>

        <button
          className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}