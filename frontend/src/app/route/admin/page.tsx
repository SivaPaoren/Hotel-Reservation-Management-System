"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/adminSession";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) router.replace("/route/login");
  }, [router]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Manage rooms. No real auth — admin mode is a local flag.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/route/admin/rooms"
          className="rounded-xl border p-5 hover:bg-gray-50"
        >
          <div className="text-lg font-medium">Manage Rooms</div>
          <div className="mt-1 text-sm text-gray-600">
            Create, edit, or delete rooms.
          </div>
        </Link>
      </div>
    </main>
  );
}
