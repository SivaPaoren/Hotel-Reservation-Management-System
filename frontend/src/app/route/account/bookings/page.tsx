"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBookings, deleteBooking } from "@/data/tempBookings";

// Minimal type for what we render here
type Booking = {
  id: string | number;
  email: string;
  roomNumber: number | string;
  type: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  nights: number;
  guests: number;
  total: number;
  pricePerNight: number;
};

// --- typed shims for JS exports ---
type ListBookingsFn = (filter?: { email?: string }) => Booking[];
const listBookingsTyped = listBookings as unknown as ListBookingsFn;

type DeleteBookingFn = (id: string | number) => void;
const deleteBookingTyped = deleteBooking as unknown as DeleteBookingFn;
// -----------------------------------

export default function MyBookingsPage() {
  const [email, setEmail] = useState<string>("");
  const [items, setItems] = useState<Booking[]>([]);

  // On first load: get ?email=...
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pre = sp.get("email") || "";
    if (pre) setEmail(pre);
  }, []);

  function refresh() {
    const q = email.trim(); // exact match by design for now
    const data = q
      ? listBookingsTyped({ email: q })
      : listBookingsTyped();
    setItems(data);
  }

  // auto-refresh when email changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <h1 className="text-2xl font-semibold">My Bookings</h1>

      {/* Search toolbar card */}
      <div className="mt-4 rounded-xl border bg-white p-4 text-black shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Filter by email used when booking"
            className="w-full max-w-md rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            onClick={refresh}
            type="button"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Search
          </button>
          <Link
            href="/route/rooms"
            className="text-sm font-medium text-blue-700 underline hover:text-blue-800"
          >
            Browse rooms
          </Link>
        </div>
      </div>

      {/* Booking list */}
      <div className="mt-6 grid gap-4">
        {items.length === 0 && <p className="text-sm">No bookings found.</p>}

        {items.map((b) => (
          <div
            key={String(b.id)}
            className="rounded-xl border bg-white p-4 text-black shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  Booking #{b.id ?? "—"} — Room #{b.roomNumber} · {b.type}
                </div>
                <div className="text-sm">
                  {b.checkIn} → {b.checkOut} ({b.nights} nights) · Guests: {b.guests}
                </div>
                <div className="text-sm">
                  Total: <span className="font-semibold">${b.total}</span>
                  <span className="ml-1">(${b.pricePerNight}/night)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/route/account/bookings/${encodeURIComponent(String(b.id))}`}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    deleteBookingTyped(b.id);
                    refresh();
                  }}
                  className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
