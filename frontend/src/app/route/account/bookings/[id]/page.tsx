"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBooking, updateBooking, deleteBooking } from "@/data/tempBookings";

// Minimal local type matching what this page actually uses.
// (Your temp store is JS, so we declare only what's needed here.)
type Booking = {
  id: string | number;
  email: string;
  roomNumber: number | string;
  type: string;
  pricePerNight: number;
  checkIn: string;  // ISO YYYY-MM-DD
  checkOut: string; // ISO YYYY-MM-DD
  guests: number;
  // ... (other fields may exist in the store, not needed here)
};

function daysBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  // normalize to noon to avoid DST edge cases
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function EditBookingPage() {
  const params = useParams();
  const id = (params as { id: string }).id; // coerce to string id
  const router = useRouter();

  const [b, setB] = useState<Booking | null>(null);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const bk = getBooking(id) as Booking | null;
    if (!bk) return;
    setB(bk);
    setCheckIn(bk.checkIn);
    setCheckOut(bk.checkOut);
    setGuests(bk.guests);
  }, [id]);

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);
  const nightly = b?.pricePerNight ?? 0;
  const total = nights * nightly;

  if (!b) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-black">
        <p className="text-sm">
          Booking not found (it may have been cleared on refresh).
        </p>
        <Link
          href="/route/account/bookings"
          className="mt-4 inline-block text-sm font-medium text-blue-700 underline hover:text-blue-800"
        >
          Back to My Bookings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-black">
      <Link
        href="/route/account/bookings"
        className="text-sm font-medium text-blue-700 hover:text-blue-800"
      >
        ← Back
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-white">
        Edit Booking #{String(b.id)}
      </h1>
      <p className="text-white">
        Room #{b.roomNumber} · {b.type} · ${nightly}/night
      </p>

      {/* Inputs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm">Nights</div>
          <div className="text-xl font-semibold">{nights}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm">Price / night</div>
          <div className="text-xl font-semibold">${nightly}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm">Total</div>
          <div className="text-2xl font-bold">${total}</div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            try {
              updateBooking(b.id, { checkIn, checkOut, guests, nights, total });
              router.push(
                `/route/account/bookings?email=${encodeURIComponent(b.email)}`
              );
            } catch (e: unknown) {
              setError((e as Error)?.message || "Failed to update booking.");
            }
          }}
          className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Save changes
        </button>

        <button
          onClick={() => {
            deleteBooking(b.id);
            router.push(
              `/route/account/bookings?email=${encodeURIComponent(b.email)}`
            );
          }}
          className="rounded-xl border px-4 py-3 text-sm font-medium text-red-600 hover:bg-gray-50"
          type="button"
        >
          Delete booking
        </button>
      </div>
    </main>
  );
}
