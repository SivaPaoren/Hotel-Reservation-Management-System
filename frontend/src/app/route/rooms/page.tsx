// frontend/src/app/route/rooms/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import RoomsFilters from "@/features/rooms/components/RoomsFilters";
import { listRooms, type Room as ApiRoom } from "@/api/rooms";
import { listBookings, type Booking as ApiBooking } from "@/api/bookings";

type RoomItem = {
  id: string;
  number: string | number;
  type: string;
  amenities: string[];
  price: number;
  available: boolean; // derived: status and, if dates selected, no overlaps
};

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = new Date(aStart).setHours(12, 0, 0, 0);
  const aE = new Date(aEnd).setHours(12, 0, 0, 0);
  const bS = new Date(bStart).setHours(12, 0, 0, 0);
  const bE = new Date(bEnd).setHours(12, 0, 0, 0);
  // [aS, aE) intersects [bS, bE)
  return aS < bE && bS < aE;
}

export default function RoomsPage() {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [onlyAvail, setOnlyAvail] = useState<boolean>(false);

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  // bookings cache for the selected date pair
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [bkErr, setBkErr] = useState<string>("");

  // prevent duplicate fetches in dev strict mode
  const roomsFetched = useRef(false);
  const lastDatesKey = useRef<string>("");

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

  // Load rooms once
  useEffect(() => {
    if (roomsFetched.current) return;
    roomsFetched.current = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listRooms();
        const mapped: RoomItem[] = (Array.isArray(data) ? data : [])
          .filter((r: ApiRoom) => r && r._id)
          .map((r: ApiRoom) => ({
            id: String(r._id),
            number: r.room_number ?? "—",
            type: String(r.type ?? "single"),
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            price: Number(r.base_price ?? 0),
            available: String(r.status ?? "available").toLowerCase() !== "unavailable",
          }));
        setRooms(mapped);
      } catch (e: any) {
        setErr(e?.message || "Failed to load rooms.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load bookings when dates are selected (one fetch per date pair)
  useEffect(() => {
    const hasDates = !!(checkIn && checkOut);
    if (!hasDates) {
      setBookings([]);
      setBkErr("");
      lastDatesKey.current = "";
      return;
    }

    const key = `${checkIn}|${checkOut}`;
    if (lastDatesKey.current === key) return; // already fetched for these dates
    lastDatesKey.current = key;

    (async () => {
      setBkErr("");
      try {
        const data = await listBookings(); // server returns all bookings
        setBookings(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setBkErr(e?.message || "Failed to load bookings for availability.");
        setBookings([]);
      }
    })();
  }, [checkIn, checkOut]);

  // Compute per-date availability
  const withDateAvailability: RoomItem[] = useMemo(() => {
    if (!checkIn || !checkOut) return rooms;

    // map bookings by roomNumber (backend Booking uses `roomNumber`)
    const taken = new Map<string, boolean>();
    for (const b of bookings) {
      const rn = String(b.roomNumber ?? "");
      const ci = String(b.checkInDate ?? "").slice(0, 10);
      const co = String(b.checkOutDate ?? "").slice(0, 10);
      const active = (b.status ?? "pending") !== "cancelled";
      if (!rn || !ci || !co || !active) continue;
      if (overlaps(checkIn, checkOut, ci, co)) {
        taken.set(rn, true);
      }
    }

    return rooms.map((r) => {
      // if room is globally unavailable, keep it off
      if (!r.available) return r;
      const rn = String(r.number ?? "");
      const blocked = rn ? taken.get(rn) : false;
      return blocked ? { ...r, available: false } : r;
    });
  }, [rooms, bookings, checkIn, checkOut]);

  const visibleRooms: RoomItem[] = useMemo(() => {
    let list = withDateAvailability;
    if (onlyAvail && checkIn && checkOut) list = list.filter((r) => r.available);
    return [...list].sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.price - b.price;
    });
  }, [withDateAvailability, onlyAvail, checkIn, checkOut]);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Available Rooms</h1>

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
              {bkErr && <span className="ml-2 text-red-600">({bkErr})</span>}
            </span>
          ) : (
            <span>Tip: select dates to see per-date availability</span>
          )}
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </div>

      {loading && <p className="text-gray-600">Loading rooms...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRooms.map((r) => (
          <article key={r.id} className="rounded-lg border p-4">
            <h2 className="text-lg font-medium">
              {r.type.toUpperCase()} • #{r.number}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{r.amenities?.join(" • ")}</p>
            <p className="mt-2 font-semibold">{r.price} THB / night</p>

            {checkIn && checkOut && !r.available && (
              <p className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                Unavailable for selected dates
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/route/rooms/${encodeURIComponent(r.id)}`}
                className="inline-block text-sm underline hover:no-underline"
              >
                View details
              </Link>

              {checkIn && checkOut && r.available && (
                <Link
                  href={`/route/rooms/${encodeURIComponent(
                    r.id
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

      {!loading && !err && visibleRooms.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">No rooms to show.</p>
      )}
    </section>
  );
}
