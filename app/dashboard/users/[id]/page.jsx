"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "../../loading";

const SingleUserPage = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          throw new Error(`Gagal fetch user: ${res.statusText}`);
        }
        const data = await res.json();
        setUser(data);
        setFormData({
          name: data.name || "",
          username: data.username || "",
          password: "",
          role: data.role ? "true" : "false",
        });
      } catch (err) {
        console.log(err);
        setError(err.message);
      }
    };
    loadUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User berhasil diupdate!");
        router.push("/dashboard/users"); // Redirect kembali ke list users setelah update
      } else {
        const errData = await res.json();
        alert(`Gagal update user: ${errData.error || res.statusText}`);
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.message);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!user)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max text-5xl">
        {user.name}
        <div className="text-2xl mt-2">@{user.username}</div>
        <div className="text-2xl mt-2">
          {user.role === 1 ? "Administrator" : "Staf"}
        </div>
      </div>

      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input type="hidden" name="id" value={user.id} />
          <label>Nama</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <label>Username</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <label>Password</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Kosongkan jika tidak ingin ubah"
          />
          <label>Adalah admin ?</label>
          <select
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
            name="role"
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
};

export default SingleUserPage;
