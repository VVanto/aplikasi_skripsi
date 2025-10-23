"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("/api/users");
        const response = await data.json();
        console.log(response);
        setUsers(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <ul>
        {users.map((users) => (
          <li key={users.id}>
            <h2>{users.name}</h2>
            <p>{users.username}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
