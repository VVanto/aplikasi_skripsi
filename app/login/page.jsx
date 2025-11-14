"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../dashboard/loading";

// Pisahkan komponen yang menggunakan useSearchParams
function LoginForm() {
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

      // 2. Preload data dashboard
      const preloadPromises = [
        fetch("/api/transaction?page=1", { credentials: "include" }),
        fetch("/api/users", { credentials: "include" }),
      ];

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
    return <Loading />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-darkOlive overflow-hidden">
      <div className="wave-container relative bg-olive rounded-[10px] w-[550px] p-10 shadow-[5px_10px_10px_rgba(2,128,144,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[5px_15px_20px_rgba(2,128,144,0.3)]">
        <div className="grid relative z-10" onSubmit={handleSubmit}>
          <h1 className="text-5xl font-bold mb-8 text-center">Login</h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300">
              <p className="text-red-700 text-center text-sm">{error}</p>
            </div>
          )}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="block w-full px-3 py-2.5 mt-4 text-base bg-lightOlive border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#028090] transition-all"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              className="block w-full px-3 py-2.5 mt-4 text-base bg-lightOlive border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#028090] transition-all"
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 px-8 py-2.5  uppercase font-semibold bg-darkOlive rounded-md border-0 cursor-pointer transition-all duration-300 hover:bg-darkOlive/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memuat..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap dengan Suspense di export default
export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}