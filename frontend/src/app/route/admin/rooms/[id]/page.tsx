"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/adminSession";
import {
  getRoom,
  updateRoom,
  deleteRoom,
  type Room,
  type UpdateRoomInput,
} from "@/api/rooms";

export default function AdminEditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as { id: string }).id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [room, setRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<UpdateRoomInput>({
    room_number: "",
    type: "single",
    base_price: 0,
    amenities: [],
    status: "available",
  });
  const [amenityInput, setAmenityInput] = useState("");

  // gate by local admin flag
  useEffect(() => {
    if (!isAdmin()) router.replace("/route/login");
  }, [router]);

  // load existing room
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getRoom(id);
        setRoom(data);
        setForm({
          room_number: data.room_number,
          type: data.type,
          base_price: data.base_price,
          amenities: data.amenities ?? [],
          status: data.status,
        });
      } catch (e: any) {
        setErr(e?.message || "Failed to load room.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const title = useMemo(() => {
    const rn = room?.room_number ?? form.room_number ?? "—";
    return `Edit Room #${rn}`;
  }, [room, form.room_number]);

  function addAmenity() {
    const val = amenityInput.trim();
    if (!val) return;
    setForm((f) => ({ ...f, amenities: [...(f.amenities || []), val] }));
    setAmenityInput("");
  }

  function removeAmenity(a: string) {
    setForm((f) => ({ ...f, amenities: f.amenities?.filter((x) => x !== a) }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await updateRoom(id, form);
      router.push("/route/admin/rooms");
    } catch (e: any) {
      setErr(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      await deleteRoom(id);
      router.push("/route/admin/rooms");
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  }

  if (!isAdmin()) return null;

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-gray-700">Loading…</p>
      </main>
    );
  }

  if (err && !room) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-600">{err}</p>
        <Link href="/route/admin/rooms" className="mt-3 inline-block underline">
          Back to rooms
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
      <Link href="/route/admin/rooms" className="text-sm text-blue-700 hover:text-blue-800">
        ← Back to rooms
      </Link>

      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Created: {room?.createdAt ? new Date(room.createdAt).toLocaleString() : "—"} · Updated:{" "}
        {room?.updatedAt ? new Date(room.updatedAt).toLocaleString() : "—"}
      </p>

      <form onSubmit={onSave} className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium">Room Number</label>
          <input
            type="text"
            value={form.room_number ?? ""}
            onChange={(e) => setForm({ ...form, room_number: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Base Price (THB)</label>
          <input
            type="number"
            min={0}
            value={form.base_price ?? 0}
            onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Amenities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
              placeholder="e.g. Wi-Fi"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.amenities?.map((a) => (
              <span key={a} className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                {a}
                <button
                  type="button"
                  onClick={() => removeAmenity(a)}
                  className="ml-2 text-red-500"
                  aria-label={`Remove ${a}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border px-4 py-3 text-sm font-medium text-red-600 hover:bg-gray-50"
          >
            Delete room
          </button>
        </div>
      </form>
    </main>
  );
}
