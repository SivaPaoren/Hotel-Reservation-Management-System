"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { mockRooms, getRoom } from "../lib/mockRooms";
import { addBooking } from "../lib/tempBookings";
import { getCurrentUser } from "../lib/tempCustomers";

function formatISO(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function BookingForm({ initialRoomId = "" }) {
  const user = getCurrentUser();
  const [roomId, setRoomId] = useState(initialRoomId);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [special, setSpecial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(""); // holds error message for modal

  const selectedRoom = useMemo(() => (roomId ? getRoom(roomId) : null), [roomId]);
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
    if (!user) errs.user = "You must be logged in.";
    return errs;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 400)); // fake latency
      const payload = {
        roomId,
        roomNumber: selectedRoom?.number,
        type: selectedRoom?.type,
        pricePerNight: nightlyPrice,
        checkIn,
        checkOut,
        nights,
        guests,
        special,
        total,
        createdAt: new Date().toISOString(),
      };
      const created = addBooking(payload);
      setSubmitted(created);
    } catch (err) {
      // show a modal popup; common message is from availability check
      setPopup(err?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Reservation Confirmed</h2>
        <p className="mt-2 text-sm text-gray-700">
          Thanks, {user?.name}. We’ve recorded your booking.
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
            href="/account/bookings"
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
    <>
      {/* Error popup (modal) */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPopup("")}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[90%] max-w-md rounded-xl border border-red-300 bg-white p-5 text-black shadow-xl">
            <h3 className="text-lg font-semibold text-red-700">Cannot complete booking</h3>
            <p className="mt-2 text-sm text-gray-700">
              {popup}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPopup("")}
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking form */}
      <form
        onSubmit={onSubmit}
        className="grid gap-6 rounded-2xl border bg-white p-6 text-black shadow-sm sm:grid-cols-5"
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
        </div>

        {/* Dates & guests */}
        <div className="grid gap-4 sm:col-span-3 sm:grid-cols-3">
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

        {/* Special requests */}
        <div className="sm:col-span-5">
          <label className="mb-1 block text-sm font-medium">Special requests (optional)</label>
          <textarea
            value={special}
            onChange={(e) => setSpecial(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Late arrival, allergy notes, etc."
          />
        </div>

        {/* Summary & actions */}
        <div className="grid gap-4 sm:col-span-5 sm:grid-cols-3">
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
          {errors.user && <p className="mb-2 text-sm text-red-600">{errors.user}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Processing…" : "Confirm booking"}
          </button>
        </div>
      </form>
    </>
  );
}
