import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Hotel RMS
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/rooms" className="hover:underline text-gray-700">Rooms</Link>
          <Link href="/book" className="hover:underline text-gray-700">Book</Link>
          <Link href="/account/bookings" className="hover:underline text-gray-700">My Bookings</Link>
        </div>
      </nav>
    </header>
  );
}

