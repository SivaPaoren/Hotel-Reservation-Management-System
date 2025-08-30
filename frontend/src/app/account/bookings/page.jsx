"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBookings, deleteBooking } from "../../../lib/tempBookings";

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState([]);

  // On first load: get ?email=...
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pre = sp.get("email") || "";
    if (pre) setEmail(pre);
  }, []);

  function refresh() {
    const q = email.trim(); // exact match by design for now
    setItems(q ? listBookings({ email: q }) : listBookings());
  }

  // auto-refresh when email changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-black">
      <h1 className="text-2xl font-semibold">My Bookings</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Filter by email used when booking"
          className="w-full max-w-md rounded-xl border px-3 py-2 text-sm"
        />
        <button
          onClick={refresh}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Search
        </button>
        <Link href="/rooms" className="text-sm text-blue-600 underline">
          Browse rooms
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-600">No bookings found.</p>
        )}

        {items.map((b) => (
          <div key={b.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  Booking #{b.id ?? "—"} — Room #{b.roomNumber} · {b.type}
                </div>
                <div className="text-sm text-gray-600">
                  {b.checkIn} → {b.checkOut} ({b.nights} nights) · Guests: {b.guests}
                </div>
                <div className="text-sm">
                  Total: <span className="font-semibold">${b.total}</span>
                  <span className="text-gray-500"> (${b.pricePerNight}/night)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/account/bookings/${b.id}`}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-white"
                >
                  Edit
                </Link>
                <button
                  onClick={() => { deleteBooking(b.id); refresh(); }}
                  className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-white"
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
