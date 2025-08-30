import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoom } from "@/lib/mockRooms";

// Server Component (default). In Next 15, params is a Promise.
export default async function RoomDetails({ params }) {
  const { id } = await params; // <-- important
  const room = getRoom(id);    // id will be a string like "2"

  if (!room) return notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/rooms" className="text-sm text-gray-600 hover:underline">
        ← Back to rooms
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Room #{room.number} · {room.type}
      </h1>
      <p className="mt-2 text-gray-700">{room.desc}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-xl font-semibold">${room.price}/night</div>
        </div>
        <div className="rounded-xl border p-4 sm:col-span-2">
          <div className="text-sm text-gray-500">Amenities</div>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {room.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/book?roomId=${room.id}`}
          className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Book this room
        </Link>
      </div>
    </main>
  );
}
