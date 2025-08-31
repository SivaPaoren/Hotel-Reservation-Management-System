"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, subscribe } from "../lib/tempCustomers";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribe(() => setUser(getCurrentUser()));
    return unsub;
  }, []);

  function handleLogout() {
    logout();
    router.push("/"); // send back to landing page
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Hotel RMS
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/rooms" className="text-gray-700 hover:underline">
            Rooms
          </Link>
          {user && (
            <Link href="/book" className="text-gray-700 hover:underline">
              Book
            </Link>
          )}
          {user && (
            <Link href="/account/bookings" className="text-gray-700 hover:underline">
              My Bookings
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-md border border-red-400 px-3 py-1 text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <Link href="/" className="text-gray-700 hover:underline">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
