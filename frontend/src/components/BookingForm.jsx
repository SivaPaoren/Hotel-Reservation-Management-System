"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { mockRooms, getRoom } from "../lib/mockRooms";
import { addBooking } from "../lib/tempBookings";


function formatISO(date) {
  // Ensure YYYY-MM-DD for <input type="date">
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0); // noon to avoid DST edges
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function BookingForm({ initialRoomId = "" }) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [special, setSpecial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // store the reservation summary
  const [errors, setErrors] = useState({});

  const selectedRoom = useMemo(() => {
    if (!roomId) return null;
    return getRoom(roomId);
  }, [roomId]);

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);
  const nightlyPrice = selectedRoom?.price ?? 0;
  const total = nights * nightlyPrice;

  const todayISO = formatISO(new Date());

  function validate() {
    const errs = {};
    if (!roomId || !selectedRoom) errs.roomId = "Please select a room.";
    if (!checkIn) errs.checkIn = "Check-in is required.";
    if (!checkOut) errs.checkOut = "Check-out is required.";
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = "Check-out must be after check-in.";
    }
    if (guests < 1) errs.guests = "At least 1 guest.";
    if (!name.trim()) errs.name = "Your name is required.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Valid email required.";
    return errs;
  }

    async function onSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
        // Mock “API” latency
        await new Promise((res) => setTimeout(res, 600));

        const payload = {
        roomId,
        roomNumber: selectedRoom?.number,
        type: selectedRoom?.type,
        pricePerNight: nightlyPrice,
        checkIn,
        checkOut,
        nights,
        guests,
        name,
        email,
        special,
        total,
        createdAt: new Date().toISOString(),
        };

        // ✅ Save to in-memory (ephemeral) store
        const created = addBooking(payload);
        setSubmitted(created);
    } finally {
        setSubmitting(false);
    }
    }



  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Reservation Confirmed</h2>
        <p className="mt-2 text-sm text-gray-700">
          Thanks, {submitted.name}. We’ve recorded your booking.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Room</div>
            <div className="font-medium">
              #{submitted.roomNumber} · {submitted.type}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Dates</div>
            <div className="font-medium">
              {submitted.checkIn} → {submitted.checkOut} ({submitted.nights} nights)
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Guests</div>
            <div className="font-medium">{submitted.guests}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-semibold">
              ${submitted.total.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-gray-500">
                (${submitted.pricePerNight}/night)
              </span>
            </div>
          </div>
        </div>

        {submitted.special && (
          <div className="mt-4 rounded-lg border p-4">
            <div className="text-sm text-gray-500">Special requests</div>
            <div className="mt-1 whitespace-pre-wrap">{submitted.special}</div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
        <Link
            href="/rooms"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-white"
        >
            Browse more rooms
        </Link>

        <Link
            href={`/account/bookings?email=${encodeURIComponent(submitted.email)}`}
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-white"
        >
            View my bookings
        </Link>

        <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
            Back to home
        </Link>
        </div>

      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-5 text-black"
    >
      {/* Room selector */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Room</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Select a room…</option>
          {mockRooms.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.number} · {r.type} (${r.price}/night)
            </option>
          ))}
        </select>
        {errors.roomId && <p className="mt-1 text-xs text-red-600">{errors.roomId}</p>}

        {selectedRoom && (
          <p className="mt-2 text-xs text-gray-600">
            Selected: Room #{selectedRoom.number} · {selectedRoom.type} · $
            {selectedRoom.price}/night
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="sm:col-span-3 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Check-in</label>
          <input
            type="date"
            min={todayISO}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          {errors.checkIn && <p className="mt-1 text-xs text-red-600">{errors.checkIn}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Check-out</label>
          <input
            type="date"
            min={checkIn || todayISO}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          {errors.guests && <p className="mt-1 text-xs text-red-600">{errors.guests}</p>}
        </div>
      </div>

      {/* Contact */}
      <div className="sm:col-span-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="john@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      {/* Special requests */}
      <div className="sm:col-span-5">
        <label className="mb-1 block text-sm font-medium">Special requests (optional)</label>
        <textarea
          value={special}
          onChange={(e) => setSpecial(e.target.value)}
          rows={4}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Late arrival, allergy notes, etc."
        />
      </div>

      {/* Summary & actions */}
      <div className="sm:col-span-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Nights</div>
          <div className="text-xl font-semibold">{nights}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Price / night</div>
          <div className="text-xl font-semibold">${nightlyPrice}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">${total.toLocaleString()}</div>
        </div>
      </div>

      <div className="sm:col-span-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Processing…" : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}
