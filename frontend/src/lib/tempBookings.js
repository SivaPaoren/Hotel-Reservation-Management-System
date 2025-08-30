// Ephemeral store: cleared on full reload.
let bookings = [];
let nextId = 1;

export function addBooking(payload) {
  // basic date sanity
  const s = new Date(payload.checkIn);
  const e = new Date(payload.checkOut);
  if (!(s < e)) throw new Error("checkOut must be after checkIn");

  const record = {
    id: nextId++,
    status: "confirmed",
    ...payload,
  };
  bookings.push(record);
  return record;
}

export function listBookings(filter = {}) {
  const { email, roomId } = filter;
  return bookings.filter(
    (b) =>
      (email ? b.email === email : true) &&
      (roomId ? String(b.roomId) === String(roomId) : true)
  );
}

export function getBooking(id) {
  return bookings.find((b) => b.id === Number(id)) || null;
}

export function updateBooking(id, patch) {
  const i = bookings.findIndex((b) => b.id === Number(id));
  if (i === -1) return null;
  bookings[i] = { ...bookings[i], ...patch };
  return bookings[i];
}

export function deleteBooking(id) {
  bookings = bookings.filter((b) => b.id !== Number(id));
}
