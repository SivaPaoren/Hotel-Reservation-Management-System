// frontend/src/app/route/admin/rooms/new/page.tsx
export const dynamic = "force-dynamic"; // skip SSG/SSR work for this route

import React from "react";
import AdminCreateRoomClient from "./AdminCreateRoomClient";

export default function Page() {
  // Server component; does not touch browser APIs.
  return <AdminCreateRoomClient />;
}
