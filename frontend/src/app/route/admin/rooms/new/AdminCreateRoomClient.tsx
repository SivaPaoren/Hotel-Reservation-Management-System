// frontend/src/app/route/admin/rooms/new/AdminCreateRoomClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/adminSession";
import { createRoom, type CreateRoomInput } from "@/api/rooms";

export default function AdminCreateRoomClient() {
  const router = useRouter();
  const [form, setForm] = useState<CreateRoomInput>({
    room_number: "",
    type: "single",
    base_price: 0,
    amenities: [],
    status: "available",
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAdmin()) {
    router.replace("/route/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createRoom(form);
      router.push("/route/admin/rooms");
    } catch (err: any) {
      setError(err?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  }

  function addAmenity() {
    const val = amenityInput.trim();
    if (!val) return;
    setForm((f) => ({ ...f, amenities: [...(f.amenities || []), val] }));
    setAmenityInput("");
  }

  function removeAmenity(a: string) {
    setForm((f) => ({ ...f, amenities: f.amenities?.filter((x) => x !== a) }));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
      <h1 className="text-3xl font-semibold">Create New Room</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium">Room Number</label>
          <input
            type="text"
            value={form.room_number}
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
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Amenities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
              placeholder="e.g. WiFi"
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
                >
                  ×
                </button>
              </span>
            ))}
          </div>
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-black disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save Room"}
        </button>
      </form>
    </main>
  );
}
