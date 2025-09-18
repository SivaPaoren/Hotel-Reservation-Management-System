"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import RoomsFilters from "@/features/rooms/components/RoomsFilters";

type RoomItem = {
  id: string | number;
  number: number | string;
  type: string;
  amenities: string[];
  price: number;
  available?: boolean;
};

export default function RoomsPage() {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [onlyAvail, setOnlyAvail] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function onFiltersChange(
    next: Partial<{ checkIn: string; checkOut: string; onlyAvail: boolean }>
  ) {
    if (next.checkIn !== undefined) {
      setCheckIn(next.checkIn);
      if (checkOut && next.checkIn && new Date(checkOut) <= new Date(next.checkIn)) {
        setCheckOut("");
      }
    }
    if (next.checkOut !== undefined) setCheckOut(next.checkOut);
    if (next.onlyAvail !== undefined) setOnlyAvail(next.onlyAvail);
  }

  // Fetch rooms from backend API
  useEffect(() => {
    async function fetchRooms() {
      const testCheckIn = checkIn || "2025-09-20";
      const testCheckOut = checkOut || "2025-09-22";
  
      setLoading(true);
      try {
        console.log('Fetching rooms with', { testCheckIn, testCheckOut });
        const { data } = await axios.get<RoomItem[]>("http://localhost:3002/api/rooms", {
          params: { checkIn: testCheckIn, checkOut: testCheckOut },
        });
        console.log('Fetched rooms:', data);
        setRooms(data);
      } catch (err: any) {
        console.error("Error fetching rooms:", err.response?.data || err.message);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }
  
    fetchRooms();
  }, [checkIn, checkOut]);
  
  // Filter and sort rooms
  const visibleRooms: RoomItem[] = useMemo(() => {
    let list = rooms;
    if (onlyAvail && checkIn && checkOut) list = list.filter((r) => r.available);
    return [...list].sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.price - b.price;
    });
  }, [rooms, onlyAvail, checkIn, checkOut]);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Available Rooms</h1>

      {/* Filters */}
      <div className="mb-5">
        <RoomsFilters
          checkIn={checkIn}
          checkOut={checkOut}
          onlyAvail={onlyAvail}
          onChange={onFiltersChange}
        />
        <div className="mt-2 text-right text-sm text-gray-600">
          {checkIn && checkOut ? (
            <span>
              Sorting: <strong>Available first</strong>, then <strong>price ↑</strong>
            </span>
          ) : (
            <span>Select dates to check availability</span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading rooms...</p>}

      {/* List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRooms.map((r) => (
          <article key={String(r.id)} className="rounded-lg border p-4">
            <h2 className="text-lg font-medium">
              {r.type.toUpperCase()} • #{r.number}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{r.amenities?.join(" • ")}</p>
            <p className="mt-2 font-semibold">{r.price} THB / night</p>

            {!r.available && (
              <p className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                Unavailable for selected dates
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/route/rooms/${encodeURIComponent(String(r.id))}`}
                className="inline-block text-sm underline hover:no-underline"
              >
                View details
              </Link>

              {checkIn && checkOut && r.available && (
                <Link
                  href={`/route/rooms/${encodeURIComponent(
                    String(r.id)
                  )}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`}
                  className="inline-block rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                >
                  Book for dates
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
