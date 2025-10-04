// frontend/src/app/route/account/bookings/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  getBooking as apiGetBooking,
  updateBooking as apiUpdateBooking,
  deleteBooking as apiDeleteBooking,
  type Booking,
} from "../../../../../api/bookings";

function daysBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  // normalize to noon to avoid DST weirdness
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function EditBookingPage() {
  const params = useParams();
  const id = (params as { id: string }).id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [bk, setBk] = useState<Booking | null>(null);

  // Form state (YYYY-MM-DD for <input type="date">)
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number | "">("");

  // Load from API
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await apiGetBooking(id);
        setBk(data);

        const ci = (data.checkInDate || "").slice(0, 10);
        const co = (data.checkOutDate || "").slice(0, 10);

        setCheckIn(ci);
        setCheckOut(co);
        setGuests(Number(data.guests ?? 1));
        setTotalPrice(
          typeof data.totalPrice === "number" ? data.totalPrice : ""
        );
      } catch (e: any) {
        setErr(e?.message || "Failed to load booking.");
        setBk(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);
  const inferredNightly =
    typeof totalPrice === "number" && nights > 0 ? Math.round((totalPrice / nights) * 100) / 100 : undefined;

  async function onSave() {
    setErr("");

    // Local guard to avoid pointless requests
    if (!checkIn || !checkOut) {
      setErr("Please select both check-in and check-out dates.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErr("Check-out must be after check-in.");
      return;
    }

    try {
      await apiUpdateBooking(id, {
        checkInDate: checkIn,     // backend accepts string | Date
        checkOutDate: checkOut,
        guests,
        totalPrice: totalPrice === "" ? undefined : Number(totalPrice),
      });
      router.push("/route/account/bookings");
    } catch (e: any) {
      // Axios-style error object: e.response.status
      const status = e?.response?.status ?? e?.status;
      if (status === 409) {
        setErr("Room not available for the selected dates.");
      } else if (status === 400) {
        setErr(e?.response?.data?.message || "Invalid input.");
      } else {
        setErr(e?.message || "Failed to update booking.");
      }
    }
  }

  async function onDelete() {
    if (!confirm("Delete this booking?")) return;
    try {
      await apiDeleteBooking(id);
      router.push("/route/account/bookings");
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-gray-700">Loading…</main>;
  }

  if (!bk) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
        <p className="text-sm">Booking not found.</p>
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
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-900">
      <Link
        href="/route/account/bookings"
        className="text-sm font-medium text-blue-700 hover:text-blue-800"
      >
        ← Back
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">Edit Booking #{bk._id}</h1>
      <p className="text-gray-700">
        Hotel: {bk.hotelName} · Room #{bk.roomNumber}
      </p>

      {/* Inputs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Nights</div>
          <div className="text-xl font-semibold">{nights}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Inferred / night</div>
          <div className="text-xl font-semibold">
            {inferredNightly != null ? `${inferredNightly} THB` : "—"}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">
            {typeof totalPrice === "number" ? `${totalPrice} THB` : "—"}
          </div>
        </div>
      </div>

      {/* Total editor */}
      <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium">Total Price (THB)</label>
        <input
          type="number"
          min={0}
          value={totalPrice}
          onChange={(e) =>
            setTotalPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="e.g. 7500"
        />
        <p className="mt-1 text-xs text-gray-500">
          We store only <code>totalPrice</code> in the booking. Nightly price is inferred for display.
        </p>
      </div>

      {/* Friendly error message */}
      {err && (
        <p className="mt-3 text-sm text-red-600">
          {err}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={onSave}
          className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Save changes
        </button>

        <button
          onClick={onDelete}
          className="rounded-xl border px-4 py-3 text-sm font-medium text-red-600 hover:bg-gray-50"
          type="button"
        >
          Delete booking
        </button>
      </div>
    </main>
  );
}
