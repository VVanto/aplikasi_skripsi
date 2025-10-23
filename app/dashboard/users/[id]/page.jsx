"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SingleUserPage({ params }) {
  const { id } = params;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name,
        username: data.username,
        password: "",
        role: data.role ? "true" : "false",
      });
    };
    fetchUserData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      alert("User updated!");
    } catch (err) {
      console.log(err);
    }
  };

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex gap-5 mt-5">
      {/* Profil kiri */}
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        <h2 className="text-xl">{user.name}</h2>
        <p className="text-sm text-gray-300">{user.username}</p>
      </div>

      {/* Form kanan */}
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label>Nama</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label>Username</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <label>Password</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
            type="password"
            placeholder="Biarkan kosong kalau tidak diubah"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <label>Adalah admin?</label>
          <select
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
          >
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>

          <button className="w-full mt-5 p-5 cursor-pointer bg-sage rounded-lg">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}
