// src/app/route/admin/rooms/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRoomById, updateRoom } from "@/data/tempRooms";
import type { Room } from "@/lib/types";
import { isAdminLoggedIn } from "@/data/tempCustomers";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");

  // form fields
  const [roomNumber, setRoomNumber] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [amenities, setAmenities] = useState("");
  const [description, setDescription] = useState("");

  // guard + load
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/route/admin");
      return;
    }
    const id = params.id;
    const r = getRoomById(id);
    if (!r) {
      setError("Room not found.");
      return;
    }
    setRoom(r);
    setRoomNumber(r.roomNumber ?? String((r as any).number ?? ""));
    setBasePrice(r.basePrice ?? r.price ?? 0);
    setAmenities(Array.isArray(r.amenities) ? r.amenities.join(", ") : "");
    setDescription(r.description ?? "");
  }, [params.id, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    try {
      updateRoom(room.id, {
        roomNumber,
        basePrice,
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        description,
      });
      router.push("/route/admin/rooms");
    } catch (err) {
      setError((err as Error).message || "Update failed.");
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="opacity-70">Loading…</p>
      </main>
    );
  }

  const headerNum = room.roomNumber ?? String((room as any).number ?? "");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Room {headerNum}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Room Number</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Base Price (THB)</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Amenities (comma separated)</label>
          <input
            type="text"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
            placeholder="Wi-Fi, AC, TV"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push("/route/admin/rooms")}
            className="rounded-md border border-white/20 px-4 py-2 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
