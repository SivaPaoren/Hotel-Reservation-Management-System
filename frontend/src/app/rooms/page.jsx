// src/app/rooms/page.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mockRooms } from "../../lib/mockRooms";
import { isRangeAvailable } from "../../lib/tempBookings";

function toISO(d) {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().split("T")[0];
}

export default function RoomsPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [onlyAvail, setOnlyAvail] = useState(false);

  const today = toISO(new Date());

  const roomsWithAvail = useMemo(() => {
    return mockRooms.map((r) => {
      const available =
        checkIn && checkOut ? isRangeAvailable(r.id, checkIn, checkOut) : true;
      return { ...r, available };
    });
  }, [checkIn, checkOut]);

  const visibleRooms = useMemo(() => {
    let list = roomsWithAvail;
    if (onlyAvail && checkIn && checkOut) list = list.filter((r) => r.available);
    return [...list].sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1; // available first
      return a.price - b.price; // then cheapest
    });
  }, [roomsWithAvail, onlyAvail, checkIn, checkOut]);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Available Rooms</h1>

      {/* Filters — tiny calendars like BookingForm */}
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              if (checkOut && v && new Date(checkOut) <= new Date(v)) {
                setCheckOut("");
              }
            }}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white text-black placeholder-gray-500"
          />
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyAvail}
              onChange={(e) => setOnlyAvail(e.target.checked)}
            />
            Only show available
          </label>
        </div>

        <div className="flex items-end justify-end text-white text-gray-600">
          {checkIn && checkOut ? (
            <span>
              Sorting: <strong>Available first</strong>, then <strong>price ↑</strong>
            </span>
          ) : (
            <span>Select dates to check availability</span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRooms.map((r) => (
          <article key={r.id} className="rounded-lg border p-4">
            <h2 className="text-lg font-medium">
              {r.type.toUpperCase()} • #{r.number}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{r.amenities.join(" • ")}</p>
            <p className="mt-2 font-semibold">{r.price} THB / night</p>

            {checkIn && checkOut && !r.available && (
              <p className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                Unavailable for selected dates
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/rooms/${r.id}`}
                className="inline-block text-sm underline hover:no-underline"
              >
                View details
              </Link>

              {checkIn && checkOut && r.available && (
                <Link
                  href={`/rooms/${r.id}?checkIn=${encodeURIComponent(
                    checkIn
                  )}&checkOut=${encodeURIComponent(checkOut)}`}
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
