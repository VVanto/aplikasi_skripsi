"use client";

import { useEffect, useState } from "react";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Search from "@/app/ui/dashboard/search/search";
import { MdAccessTime, MdPerson, MdDescription } from "react-icons/md";
import Loading from "../loading";

export default function LogsPage({ searchParams }) {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const q = searchParams?.q || "";
  const page = Math.max(1, parseInt(searchParams?.page) || 1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/logs?q=${q}&page=${page}`);
        const data = await res.json();
        setLogs(data.logs || []);
        setCount(data.count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [q, page]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <div className="flex justify-between items-center mb-5">
        <Search placeholder="Cari aktivitas..." />
        <div className="text-sm text-cream/70">
          Total: <strong>{count}</strong> log
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-cream/60">
          <MdDescription className="mx-auto text-6xl mb-3 opacity-30" />
          <p>Tidak ada aktivitas</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-olive/50 border border-lightOlive/30 p-4 rounded-lg hover:bg-olive/70 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Icon & Time */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                      <MdAccessTime className="text-sage" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-medium text-cream">{log.deskrip}</p>
                    <div className="flex items-center gap-4 text-xs text-cream/60 mt-1">
                      <span className="flex items-center gap-1">
                        <MdAccessTime /> {formatDate(log.createdAt)}
                      </span>
                      {log.userName && (
                        <span className="flex items-center gap-1">
                          <MdPerson /> {log.userName} (@{log.username})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination count={count} />
          </div>
        </>
      )}
    </div>
  );
}