"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBooking, updateBooking, deleteBooking } from "../../../../lib/tempBookings";

import { getRoom } from "@/lib/mockRooms";

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  const ms = e.setHours(12,0,0,0) - s.setHours(12,0,0,0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function EditBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [b, setB] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const bk = getBooking(id);
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
        <p className="text-sm text-gray-600">Booking not found (it may have been cleared on refresh).</p>
        <Link href="/account/bookings" className="mt-4 inline-block text-sm text-blue-600 underline">
          Back to My Bookings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-black">
      <Link href="/account/bookings" className="text-sm text-gray-600 hover:underline">← Back</Link>
      <h1 className="mt-3 text-2xl font-semibold">Edit Booking #{b.id}</h1>
      <p className="text-sm text-gray-600">
        Room #{b.roomNumber} · {b.type} · ${nightly}/night
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input type="date" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)}
                 className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input type="date" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)}
                 className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Guests</label>
          <input type="number" min={1} value={guests}
                 onChange={(e)=>setGuests(Number(e.target.value))}
                 className="w-full rounded-xl border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Nights</div>
          <div className="text-xl font-semibold">{nights}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Price / night</div>
          <div className="text-xl font-semibold">${nightly}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">${total}</div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            try {
              updateBooking(b.id, { checkIn, checkOut, guests, nights, total });
              router.push(`/account/bookings?email=${encodeURIComponent(b.email)}`);
            } catch (e) {
              setError(e.message || "Failed to update booking.");
            }
          }}
          className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Save changes
        </button>

        <button
          onClick={() => { deleteBooking(b.id); router.push(`/account/bookings?email=${encodeURIComponent(b.email)}`); }}
          className="rounded-xl border px-4 py-3 text-sm font-medium text-red-600 hover:bg-white"
        >
          Delete booking
        </button>
      </div>
    </main>
  );
}
