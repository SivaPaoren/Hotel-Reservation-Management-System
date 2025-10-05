// frontend/src/app/route/account/bookings/MyBookingsClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listBookings, deleteBooking, type Booking } from "@/api/bookings";
import { getCurrentCustomer, logout } from "@/lib/session";

export default function MyBookingsClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState(() => getCurrentCustomer());

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [all, setAll] = useState<Booking[]>([]);
  const didFetch = useRef(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentCustomer();
    setMe(user);
    if (!user) router.replace("/route/login");
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    if (!me) return;
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listBookings();
        setAll(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted, me]);

  const mine = useMemo(() => {
    if (!me) return [];
    return all.filter((b) => {
      if (typeof b.customer === "string") return b.customer === me._id;
      return b.customer?._id === me._id;
    });
  }, [all, me]);

  if (!mounted) return null;
  if (!me) return <main className="p-6 text-sm text-gray-600">Redirecting to login…</main>;

  async function onDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    try {
      await deleteBooking(id);
      setAll((prev) => prev.filter((b) => b._id !== id));
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <div className="text-sm text-gray-700">
          Signed in as <strong>{me.name}</strong>
          <button
            onClick={() => {
              logout();
              router.push("/route/login");
            }}
            className="ml-3 rounded-md border px-2 py-1 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {loading && <p className="mt-3 text-sm text-gray-600">Loading…</p>}

      {!loading && !err && mine.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">
          You have no bookings yet.{" "}
          <Link href="/route/rooms" className="underline">
            Find a room
          </Link>
        </p>
      )}

      <div className="mt-6 grid gap-4">
        {mine.map((b) => {
          const checkIn = (b.checkInDate || "").slice(0, 10);
          const checkOut = (b.checkOutDate || "").slice(0, 10);
          const roomNumber = b.roomNumber;

          return (
            <div key={b._id} className="rounded-xl border bg-white p-4 text-black shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    Booking #{b._id} — Room #{roomNumber}
                  </div>
                  <div className="text-sm">
                    {checkIn} → {checkOut} · Guests: {b.guests}
                  </div>
                  <div className="text-sm">
                    {b.totalPrice != null ? (
                      <>
                        Total: <span className="font-semibold">{b.totalPrice} THB</span>
                      </>
                    ) : (
                      <span className="opacity-70">Price not recorded</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs opacity-70">Status: {b.status}</div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/route/account/bookings/${encodeURIComponent(b._id)}`}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete(b._id)}
                    className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">{b.hotelName}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
