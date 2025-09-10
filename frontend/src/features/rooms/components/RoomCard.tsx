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
  const { id, type, number, amenities, price, available } = room;

  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-lg font-medium">
        {type.toUpperCase()} • #{number}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{amenities.join(" • ")}</p>
      <p className="mt-2 font-semibold">{price} THB / night</p>

      {checkIn && checkOut && available === false && (
        <p className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
          Unavailable for selected dates
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Link
          href={`/rooms/${id}`}
          className="inline-block text-sm underline hover:no-underline"
        >
          View details
        </Link>

        {checkIn && checkOut && available !== false && (
          <Link
            href={`/rooms/${id}?checkIn=${encodeURIComponent(
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
