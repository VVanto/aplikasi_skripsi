"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/app/ui/dashboard/alert/useAlert";   
import Loading from "../../loading";                            

const AddUserPage = () => {
  const router = useRouter();
  const { success, error } = useAlert();                     

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);           
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        success("User berhasil ditambahkan!");
        setFormData({ name: "", username: "", password: "", role: "" });
        router.push("/dashboard/users");
      } else {
        throw new Error(data.error || "Gagal menambahkan user");
      }
    } catch (err) {
      console.error("Error submit:", err);
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading saat submit
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap justify-between">
        <input
          type="text"
          placeholder="Nama Pengguna"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-transparent w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
          disabled={loading}
        />

        <div className="w-5/12 mb-7 relative">
          <input
            type="text"
            placeholder="Username (maks. 12 karakter)"
            name="username"
            value={formData.username}
            onChange={(e) => {
              if (e.target.value.length <= 12) {
                setFormData({ ...formData, username: e.target.value });
              }
            }}
            maxLength={12}
            className="bg-transparent border border-lightOlive p-7 w-full rounded-lg"
            required
            disabled={loading}
          />
          <span className="absolute right-3 bottom-2 text-xs text-gray-400">
            {formData.username.length}/12
          </span>
        </div>

        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
          required
          disabled={loading}
        />

        <select
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="bg-olive w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
          required
          disabled={loading}
        >
          <option value="" disabled>
            Pilih Role
          </option>
          <option value="1">Administrator</option>
          <option value="0">Staf</option>
        </select>

        <button
          className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddUserPage;