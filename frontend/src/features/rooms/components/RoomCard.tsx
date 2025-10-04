// frontend/src/features/rooms/components/RoomCard.tsx
"use client";

import Link from "next/link";
import type { Room } from "@/lib/types";

type RoomWithAvail = Room & { available?: boolean };

type Props = {
  room: RoomWithAvail;
  checkIn: string;
  checkOut: string;
};

export default function RoomCard({ room, checkIn, checkOut }: Props) {
  const { id, type, number, amenities = [], price, available } = room;
  const idEnc = encodeURIComponent(String(id));
  const typeLabel = String(type || "").toUpperCase();
  const numLabel = String(number ?? "—");

  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-lg font-medium">
        {typeLabel} • #{numLabel}
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {amenities.length ? amenities.join(" • ") : "No listed amenities"}
      </p>
      <p className="mt-2 font-semibold">{price} THB / night</p>

      {checkIn && checkOut && available === false && (
        <p className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
          Unavailable for selected dates
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Link
          href={`/route/rooms/${idEnc}`}
          className="inline-block text-sm underline hover:no-underline"
        >
          View details
        </Link>

        {checkIn && checkOut && available !== false && (
          <Link
            href={`/route/rooms/${idEnc}?checkIn=${encodeURIComponent(
              checkIn
            )}&checkOut=${encodeURIComponent(checkOut)}`}
            className="inline-block rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          >
            Book for dates
          </Link>
        )}
      </div>
    </article>
  );
}
