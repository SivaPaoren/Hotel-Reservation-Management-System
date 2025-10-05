// frontend/src/features/bookings/components/BookingForm.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { listRooms } from "@/api/rooms";
import {
  listBookings,
  createBooking,
  type CreateBookingInput,
  type Booking,
} from "@/api/bookings";
import { getCurrentCustomer } from "@/lib/session";
import { todayISO as _todayISO } from "@/lib/dates";

type Props = { initialRoomId?: string };

type Errors = Partial<{
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  user: string;
}>;

type Room = {
  id: string; // Mongo _id
  number: string | number; // room_number
  type: string; // "single" | "double" | "suite"
  price: number; // base_price
  amenities: string[];
};

function daysBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = new Date(aStart).setHours(12, 0, 0, 0);
  const aE = new Date(aEnd).setHours(12, 0, 0, 0);
  const bS = new Date(bStart).setHours(12, 0, 0, 0);
  const bE = new Date(bEnd).setHours(12, 0, 0, 0);
  // [aS, aE) intersects [bS, bE)
  return aS < bE && bS < aE;
}

export default function BookingForm({ initialRoomId = "" }: Props) {
  const customer = getCurrentCustomer();

  // Rooms from BACKEND
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsErr, setRoomsErr] = useState<string>("");

  // Form state
  const [roomId, setRoomId] = useState<string>(initialRoomId);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [special, setSpecial] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [popup, setPopup] = useState<string>("");

  // availability state based on real bookings
  const [availability, setAvailability] =
    useState<"idle" | "checking" | "ok" | "conflict">("idle");
  const lastDatesKey = useRef<string>(""); // avoid duplicate fetches in dev
  const submittingRef = useRef(false); // guard double submit in dev

  // Load rooms via API client (env-aware)
  useEffect(() => {
    (async () => {
      try {
        const data = await listRooms();
        const mapped: Room[] = (Array.isArray(data) ? data : [])
          .filter((r: any) => r && r._id)
          .map((r: any) => ({
            id: String(r._id),
            number: r.room_number ?? r.number ?? "—",
            type: String(r.type ?? "standard"),
            price: Number(r.base_price ?? r.price ?? 0),
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
          }));
        setRooms(mapped);
        if (initialRoomId && !mapped.find((r) => r.id === initialRoomId)) setRoomId("");
      } catch (e: any) {
        setRoomsErr(e?.message || "Failed to load rooms.");
      }
    })();
  }, [initialRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === roomId) || null,
    [rooms, roomId]
  );

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);
  const nightlyPrice = selectedRoom?.price ?? 0;
  const total = nights * nightlyPrice;
  const today = _todayISO ? _todayISO() : new Date().toISOString().slice(0, 10);

  // Pre-check availability using real bookings whenever (roomId, checkIn, checkOut) are set
  useEffect(() => {
    const rn = selectedRoom?.number;
    const hasInputs = rn != null && checkIn && checkOut;
    if (!hasInputs) {
      setAvailability("idle");
      lastDatesKey.current = "";
      return;
    }

    const key = `${rn}|${checkIn}|${checkOut}`;
    if (lastDatesKey.current === key) return; // already checked
    lastDatesKey.current = key;

    (async () => {
      try {
        setAvailability("checking");
        const all = await listBookings();
        const conflict = (all || []).some((b) => {
          const bookedRoomNum = String(b.roomNumber ?? "");
          const status = String(b.status ?? "pending").toLowerCase();
          const active = status !== "cancelled";
          if (!active || !bookedRoomNum) return false;

          const bIn = String(b.checkInDate ?? "").slice(0, 10);
          const bOut = String(b.checkOutDate ?? "").slice(0, 10);
          if (!bIn || !bOut) return false;

          return String(rn) === bookedRoomNum && overlaps(checkIn, checkOut, bIn, bOut);
        });
        setAvailability(conflict ? "conflict" : "ok");
      } catch {
        // On network failure, don't hard-block the form; just reset indicator
        setAvailability("idle");
      }
    })();
  }, [selectedRoom?.number, checkIn, checkOut]);

  function validate(): Errors {
    const errs: Errors = {};
    if (!roomId || !selectedRoom) errs.roomId = "Please select a room.";
    if (!checkIn) errs.checkIn = "Check-in is required.";
    if (!checkOut) errs.checkOut = "Check-out is required.";
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = "Check-out must be after check-in.";
    }
    if (guests < 1) errs.guests = "At least 1 guest.";
    if (!customer) errs.user = "You must be logged in.";
    return errs;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!customer || !selectedRoom) {
      setPopup("Missing customer or room.");
      return;
    }

    // Hard stop if we *know* it's already taken
    if (availability === "conflict") {
      setPopup("This room is already booked for those dates. Please change dates or pick another room.");
      return;
    }

    if (submittingRef.current) return; // strict-mode double submit guard
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const payload: CreateBookingInput = {
        customer: customer._id,
        hotelName: "Hotel RMS",
        roomNumber: String(selectedRoom.number),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests,
        totalPrice: total,
        status: "pending",
      };

      // stable idempotency key: user + room + dates + guests
      const idemKey = `${customer._id}:${roomId}:${checkIn}:${checkOut}:${guests}`;

      const created = await createBooking(payload, { idempotencyKey: idemKey });
      setSubmitted(created);
    } catch (err: any) {
      setPopup(err?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm text-black">
        <h2 className="text-xl font-semibold">Reservation Confirmed</h2>
        <p className="mt-2 text-sm">Thanks, {customer?.name}. We’ve recorded your booking.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-sm">Room</div>
            <div className="font-medium">
              #{selectedRoom?.number} · {selectedRoom?.type}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm">Dates</div>
            <div className="font-medium">
              {checkIn} → {checkOut} ({nights} nights)
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm">Guests</div>
            <div className="font-medium">{guests}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm">Total</div>
            <div className="font-semibold">
              {total.toLocaleString()} THB
              <span className="ml-1 text-xs font-normal">({nightlyPrice}/night)</span>
            </div>
          </div>
        </div>

        {special && (
          <div className="mt-4 rounded-lg border p-4">
            <div className="text-sm">Special requests</div>
            <div className="mt-1 whitespace-pre-wrap">{special}</div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/route/rooms"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-white"
          >
            Browse more rooms
          </Link>
          <Link
            href="/route/account/bookings"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-white"
          >
            View my bookings
          </Link>
          <Link
            href="/route"
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
      {/* Error popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPopup("")} aria-hidden="true" />
          <div className="relative z-10 w-[90%] max-w-md rounded-xl border border-red-300 bg-white p-5 text-black shadow-xl">
            <h3 className="text-lg font-semibold text-red-700">Cannot complete booking</h3>
            <p className="mt-2 text-sm text-gray-700">{popup}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setPopup("")} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking form */}
      <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border bg-white p-6 text-black shadow-sm sm:grid-cols-5">
        {/* Room selector */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Room</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">Select a room…</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.number} · {r.type} ({r.price} THB/night)
              </option>
            ))}
          </select>
          {roomsErr && <p className="mt-1 text-xs text-red-600">{roomsErr}</p>}
          {errors.roomId && <p className="mt-1 text-xs text-red-600">{errors.roomId}</p>}
        </div>

        {/* Dates & guests */}
        <div className="grid gap-4 sm:col-span-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Check-in</label>
            <input
              type="date"
              min={today}
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
              min={checkIn || today}
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

        {/* Availability hint */}
        {roomId && checkIn && checkOut && (
          <div className="sm:col-span-5 text-sm">
            {availability === "checking" && <span className="text-gray-600">Checking availability…</span>}
            {availability === "ok" && <span className="text-green-700">✔ Room is available for the selected dates</span>}
            {availability === "conflict" && <span className="text-red-700">✖ Room is already booked for these dates</span>}
          </div>
        )}

        {/* Summary & actions */}
        <div className="grid gap-4 sm:col-span-5 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">Nights</div>
            <div className="text-xl font-semibold">{nights}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">Price / night</div>
            <div className="text-xl font-semibold">{nightlyPrice} THB</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{total.toLocaleString()} THB</div>
          </div>
        </div>

        {/* Errors + submit */}
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
