// frontend/src/ui/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentCustomer, logout, subscribe } from "@/lib/session";
import { isAdmin, logoutAdmin } from "@/lib/adminSession";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getCurrentCustomer>>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentCustomer());
    setAdmin(isAdmin());

    const unsub = subscribe(() => setUser(getCurrentCustomer()));

    const onStorage = () => setAdmin(isAdmin());
    window.addEventListener("storage", onStorage);

    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!mounted) return null;

  function handleLogout() {
    if (admin) {
      logoutAdmin();
      setAdmin(false);
    } else {
      logout();
      setUser(null);
    }
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

        <div className="flex items-center gap-4 text-sm">
          {/* Always visible */}
          <Link href="/route/rooms" className="text-gray-700 hover:underline">
            Rooms
          </Link>

          {admin ? (
            <>
              <Link href="/route/admin" className="text-gray-700 hover:underline">
                Admin Dashboard
              </Link>
              <Link href="/route/admin/rooms" className="text-gray-700 hover:underline">
                Manage Rooms
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-red-400 px-3 py-1 text-red-600 hover:bg-red-50"
                type="button"
              >
                Logout (Admin)
              </button>
            </>
          ) : user ? (
            <>
              <Link href="/route/book" className="text-gray-700 hover:underline">
                Book
              </Link>
              <Link href="/route/account/bookings" className="text-gray-700 hover:underline">
                My Bookings
              </Link>
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
              <Link href="/route/login" className="text-gray-700 hover:underline">
                Login
              </Link>
              <Link href="/route/register" className="text-gray-700 hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
