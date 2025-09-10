import BookingForm from "@/features/bookings/components/BookingForm";

type Search = {
  roomId?: string | string[];
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const s = await searchParams;
  const roomId =
    (Array.isArray(s.roomId) ? s.roomId?.[0] : s.roomId) ?? "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Book a Room</h1>
      <p className="mt-2 text-sm text-gray-600">
        Choose your dates and confirm your reservation. You can change the room if needed.
      </p>

      <div className="mt-8">
        <BookingForm initialRoomId={roomId} />
      </div>
    </main>
  );
}
