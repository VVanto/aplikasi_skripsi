"use client";

import { useState } from "react";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User berhasil ditambahkan!");
        setFormData({ name: "", username: "", password: "", role: "" });
      } else {
        alert("Gagal menambahkan user!");
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        />
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />
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
        />

        <select
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="bg-olive w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
        >
          <option disabled value="">
            Apakah ini akun admin?
          </option>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>

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

export default AddUserPage;
