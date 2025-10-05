// frontend/src/app/route/account/bookings/page.tsx
export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import MyBookingsClient from "./MyBookingsClient";

export default function Page() {
  // Server wrapper renders only a fallback; client does the real work.
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading…</div>}>
      <MyBookingsClient />
    </Suspense>
  );
}
