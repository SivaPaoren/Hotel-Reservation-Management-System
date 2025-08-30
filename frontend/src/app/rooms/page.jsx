// src/app/rooms/page.jsx
import { mockRooms } from "../../lib/mockRooms"

export const metadata = { title: "Rooms • Hotel RMS" }

export default function RoomsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Available Rooms</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRooms.map(r => (
          <article key={r.id} className="rounded-lg border p-4">
            <h2 className="text-lg font-medium">{r.type.toUpperCase()} • #{r.number}</h2>
            <p className="mt-1 text-sm text-gray-600">{r.amenities.join(" • ")}</p>
            <p className="mt-2 font-semibold">{r.price} THB / night</p>
            <a href={`/rooms/${r.id}`} className="inline-block mt-3 text-sm underline hover:no-underline">
              View details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
