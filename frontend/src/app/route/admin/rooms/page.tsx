"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/adminSession";
import { listRooms, deleteRoom, type Room } from "@/api/rooms";

export default function AdminRoomsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/route/login");
      return;
    }
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listRooms();
        setRooms(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete room ${label}? This cannot be undone.`)) return;
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r._id !== id));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Rooms</h1>
        <Link
          href="/route/admin/rooms/new"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          + Create Room
        </Link>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {loading && <p className="mt-3 text-sm text-gray-600">Loading…</p>}

      {!loading && !err && rooms.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">No rooms yet.</p>
      )}

      <div className="mt-6 grid gap-3">
        {rooms.map((r) => {
          const label = `#${r.room_number} · ${r.type} · ${r.base_price} THB/night`;
          return (
            <div
              key={r._id}
              className="rounded-xl border bg-white p-4 text-black shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    Room #{r.room_number} — {r.type}
                  </div>
                  <div className="text-sm text-gray-700">
                    {r.amenities?.join(" • ") || "—"}
                  </div>
                  <div className="text-sm">
                    Price: <strong>{r.base_price} THB</strong> · Status:{" "}
                    <span className="uppercase">{r.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                <Link
                href={`/route/admin/rooms/${encodeURIComponent(r._id)}`}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(r._id, label)}
                    className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
