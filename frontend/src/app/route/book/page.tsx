// frontend/src/app/route/book/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingForm from "@/features/bookings/components/BookingForm";
import { getCurrentCustomer } from "@/lib/session";

export default function BookPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // Session guard
  useEffect(() => {
    const me = getCurrentCustomer();
    if (!me) router.replace("/route/login");
  }, [router]);

  const roomId = useMemo(() => {
    const v = sp.get("roomId");
    return v ?? "";
  }, [sp]);

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
