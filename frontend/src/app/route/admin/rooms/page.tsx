// src/app/route/admin/rooms/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";
import { listRooms, deleteRoom } from "@/data/tempRooms";
import { isAdminLoggedIn } from "@/data/tempCustomers";

export default function AdminRoomsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string>("");

  // Guard: only admins
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/route/admin"); // go to admin login
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    setLoading(true);
    try {
      const rows = listRooms();
      setItems(rows);
    } catch (e: unknown) {
      setErr((e as Error)?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const ok = deleteRoom(id);
      if (!ok) throw new Error("Delete failed.");
      // Optimistic refresh
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      setErr((e as Error)?.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  const totalActive = useMemo(
    () => items.filter((r) => (r as any).status !== "UNAVAILABLE" && (r as any).active !== false).length,
    [items]
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm opacity-70">
            {loading ? "Loading…" : `${items.length} total • ${totalActive} active`}
          </p>
        </div>
        <Link
          href="/route/admin/rooms/new"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
        >
          + New Room
        </Link>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Base Price</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center opacity-70" colSpan={6}>
                  No rooms yet. Click <span className="underline">New Room</span> to add one.
                </td>
              </tr>
            )}

            {items.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-4 py-3">{(r as any).number ?? r.roomNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.roomNumber}</div>
                  {r.description && (
                    <div className="text-xs opacity-60 line-clamp-1">{r.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{String((r as any).type ?? "STANDARD")}</td>
                <td className="px-4 py-3">{String((r as any).status ?? "AVAILABLE")}</td>
                <td className="px-4 py-3">
                  ฿{Number((r as any).basePrice ?? r.price).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/route/admin/rooms/${r.id}/edit`}
                      className="rounded-md border border-white/15 px-3 py-1 text-xs hover:bg-white/10"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-md border border-red-400/30 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {busyId === r.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td className="px-4 py-6 text-center opacity-70" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
