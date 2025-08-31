// Ephemeral store: cleared on full reload.
// Now ties each booking to the current user and prevents date overlaps.

import { getCurrentUser } from "./tempCustomers";

let bookings = [];
let nextId = 1;

function overlaps(aStart, aEnd, bStart, bEnd) {
  const s1 = new Date(aStart).setHours(12, 0, 0, 0);
  const e1 = new Date(aEnd).setHours(12, 0, 0, 0);
  const s2 = new Date(bStart).setHours(12, 0, 0, 0);
  const e2 = new Date(bEnd).setHours(12, 0, 0, 0);
  // [start, end) exclusive of checkout
  return s1 < e2 && e1 > s2;
}

// --- Public API ---

export function addBooking(payload) {
  const user = getCurrentUser();
  if (!user) throw new Error("Please log in before making a booking.");

  const s = new Date(payload.checkIn);
  const e = new Date(payload.checkOut);
  if (!(s < e)) throw new Error("checkOut must be after checkIn");

  // Normalize room id to string for consistent comparisons
  const roomIdStr = String(payload.roomId);

  // Prevent overlap for same room across ALL users
  const conflict = bookings.some(
    (b) =>
      String(b.roomId) === roomIdStr &&
      overlaps(payload.checkIn, payload.checkOut, b.checkIn, b.checkOut)
  );
  if (conflict) throw new Error("Selected dates are not available for this room.");

  const record = {
    id: nextId++,
    status: "confirmed",
    ...payload,

    // store as string to avoid number/string mismatches
    roomId: roomIdStr,

    customerId: user.customer_id,
    email: user.email,
    customerName: user.name,
    createdAt: new Date().toISOString(),
  };
  bookings.push(record);
  return record;
}

export function listBookings() {
  const user = getCurrentUser();
  if (!user) return [];
  return bookings.filter((b) => b.email === user.email);
}

export function getBooking(id) {
  const user = getCurrentUser();
  if (!user) return null;
  const b = bookings.find((b) => b.id === Number(id));
  if (!b) return null;
  if (b.email !== user.email) return null;
  return b;
}

export function updateBooking(id, patch) {
  const user = getCurrentUser();
  if (!user) return null;

  const i = bookings.findIndex((b) => b.id === Number(id));
  if (i === -1) return null;
  if (bookings[i].email !== user.email) return null;

  const next = { ...bookings[i], ...patch };

  // Use normalized room id when checking conflicts
  const nextRoomIdStr = String(next.roomId);
  const conflict = bookings.some(
    (b) =>
      String(b.roomId) === nextRoomIdStr &&
      b.id !== next.id &&
      overlaps(next.checkIn, next.checkOut, b.checkIn, b.checkOut)
  );
  if (conflict) throw new Error("Selected dates are not available for this room.");

  bookings[i] = next;
  return next;
}

export function deleteBooking(id) {
  const user = getCurrentUser();
  if (!user) return;
  bookings = bookings.filter((b) => !(b.id === Number(id) && b.email === user.email));
}

// For calendar UI: return blocked ranges for a room
export function getBookedRanges(roomId) {
  const target = String(roomId);
  return bookings
    .filter((b) => String(b.roomId) === target)
    .map((b) => ({ start: b.checkIn, end: b.checkOut, bookingId: b.id }));
}

// Availability for a specific room across ALL users in this session.
// exceptId (optional) lets you ignore one booking during edits.
export function isRangeAvailable(roomId, checkIn, checkOut, exceptId = null) {
  const target = String(roomId);
  return !bookings.some((b) => {
    if (String(b.roomId) !== target) return false;
    if (exceptId != null && String(b.id) === String(exceptId)) return false;
    const s1 = new Date(checkIn).setHours(12, 0, 0, 0);
    const e1 = new Date(checkOut).setHours(12, 0, 0, 0);
    const s2 = new Date(b.checkIn).setHours(12, 0, 0, 0);
    const e2 = new Date(b.checkOut).setHours(12, 0, 0, 0);
    return s1 < e2 && e1 > s2;
  });
}
