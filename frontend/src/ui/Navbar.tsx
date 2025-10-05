// frontend/src/ui/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentCustomer, logout, subscribe } from "@/lib/session";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getCurrentCustomer>>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentCustomer());

    // update when session changes in this tab
    const unsub = subscribe(() => setUser(getCurrentCustomer()));
    return () => unsub();
  }, []);

  if (!mounted) return null;

  function handleLogout() {
    logout();
    setUser(null);
    router.push("/route/login");
  }

  return (
    <header className="relative z-50 border-b bg-white">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/route"
          className="text-left text-lg font-semibold text-gray-900"
          aria-label="Go to home"
        >
          Hotel RMS
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-700">
          <Link href="/route/rooms" className="hover:underline">Rooms</Link>

          {user ? (
            <>
              <Link href="/route/book" className="hover:underline">Book</Link>
              <Link href="/route/account/bookings" className="hover:underline">My Bookings</Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-red-400 px-3 py-1 text-red-600 hover:bg-red-50"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/route/login" className="hover:underline">Login</Link>
              <Link href="/route/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
