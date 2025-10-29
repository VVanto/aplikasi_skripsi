// app/login/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../dashboard/loading";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "session_expired") {
      setError("Sesi telah berakhir. Silakan login kembali.");
    }
    const cleanUrl = new URL(window.location);
    cleanUrl.searchParams.delete("error");
    window.history.replaceState({}, "", cleanUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login dulu
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        setError(err.error || "Gagal login");
        setLoading(false);
        return;
      }

      // 2. Preload data dashboard (contoh: transaksi)
      const preloadPromises = [
        fetch("/api/transaction?page=1", { credentials: "include" }),
        fetch("/api/users", { credentials: "include" }),
        // tambah API lain sesuai kebutuhan
      ];

      // Tunggu semua selesai
      const responses = await Promise.all(preloadPromises);
      const hasError = responses.some((res) => !res.ok);

      if (hasError) {
        console.warn("Preload gagal, tetap redirect");
      }

      // 3. Redirect setelah semua data siap
      router.push("/dashboard");
    } catch (err) {
      setError("Koneksi gagal");
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Memuat dashboard..." />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-olive p-12 rounded-lg w-[500px] h-[500px] flex flex-col justify-center">
        <h1 className="text-6xl  mb-16 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4 bg-red-900/20 p-3 rounded-lg text-center">{error}</p>}
        <input
          typze="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive "
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive "
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-4 mt-10 bg-sage  rounded-lg disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Login"}
        </button>
      </form>
    </div>
  );
}