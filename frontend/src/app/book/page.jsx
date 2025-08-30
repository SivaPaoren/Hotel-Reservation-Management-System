"use client";

import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default function BookPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Book a Room</h1>
      <p className="mt-2 text-sm text-gray-600">
        Choose your dates and confirm your reservation. You can change the room if needed.
      </p>

      <div className="mt-8">
        <BookingForm initialRoomId={roomId} />
      </div>
    </main>
  );
}
