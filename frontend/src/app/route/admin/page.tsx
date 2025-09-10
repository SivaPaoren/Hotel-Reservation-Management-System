// src/app/route/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLoggedIn, loginAdmin } from "@/data/tempCustomers";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@hotel.test");
  const [password, setPassword] = useState("demo123"); // demo only
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, skip to rooms
  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.replace("/route/admin/rooms");
    }
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      loginAdmin({ email, password });   // <-- key: use in-memory login
      router.push("/route/admin/rooms");
    } catch (err) {
      setError((err as Error).message || "Admin login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-white">Hotel Reservation Demo</h1>
      <p className="mt-2 text-white">Admin sign in</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-xl border border-gray-700 bg-white/5 p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-400"
              placeholder="admin@hotel.test"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-400"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <div className="mt-1 text-xs text-gray-400">
              Demo: <code>admin@hotel.test</code> / <code>demo123</code>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {submitting ? "Continuing..." : "Continue"}
          </button>
        </div>
      </form>
    </main>
  );
}
