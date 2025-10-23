"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Login berhasil!");
        router.push("/dashboard"); // Redirect ke dashboard setelah login
        setFormData({ username: "", password: "" });
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal login");
      }
    } catch (error) {
      console.log(error);
      setError("Error: " + error.message);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-olive p-12 rounded-lg w-[500px] h-[500px] flex flex-col justify-center"
      >
        <h1 className="text-6xl mb-16">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive"
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive"
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button className="px-7 py-4 mt-10 bg-sage cursor-pointer rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}
