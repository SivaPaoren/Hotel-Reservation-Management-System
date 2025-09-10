"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, subscribe, getCurrentUser } from "@/data/tempCustomers";
import type { Customer } from "@/data/tempCustomers";

export default function Navbar() {
  const [user, setUser] = useState<Customer | null>(getCurrentUser());
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribe(() => {
      setUser(getCurrentUser());
    });
    return () => {
      unsub(); // ensure cleanup returns void
    };
  }, []);

  function handleLogout() {
    logout();
    router.push("/route"); // root now lives under /route
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/route" className="text-lg font-semibold text-gray-900">
          Hotel RMS
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/route/rooms" className="text-gray-700 hover:underline">
            Rooms
          </Link>

          {user && (
            <>
              <Link href="/route/book" className="text-gray-700 hover:underline">
                Book
              </Link>
              <Link href="/route/account/bookings" className="text-gray-700 hover:underline">
                My Bookings
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-md border border-red-400 px-3 py-1 text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <Link href="/route" className="text-gray-700 hover:underline">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
