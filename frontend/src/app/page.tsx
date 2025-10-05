// frontend/src/app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentCustomer } from "../lib/session";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentCustomer();
    if (current) router.replace("/route/rooms");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 text-gray-900">
      <h1 className="text-3xl font-bold tracking-tight">Hotel Reservation Demo</h1>
      <p className="mt-2 text-gray-700">Choose how you’d like to enter the system.</p>

      <div className="mt-8 grid gap-3">
        <Link
          href="/route/login"
          className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-gray-50"
        >
          Customer login
        </Link>

        <Link
          href="/route/admin"
          className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-gray-50"
        >
          Admin
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-500 text-center">
        New here? <Link href="/route/register" className="underline underline-offset-2">Create an account</Link>
      </p>
    </main>
  );
}
