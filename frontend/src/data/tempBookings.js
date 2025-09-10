// src/data/tempBookings.js
// Ephemeral in-memory booking store. Clears on full reload.
// Bookings are tied to the current logged-in customer (from tempCustomers).

import { getCurrentUser } from "./tempCustomers";

let bookings = [];
let nextId = 1;

// Utility: normalize to midday for overlap-safe comparisons
function normalizeDate(d) {
  return new Date(d).setHours(12, 0, 0, 0);
}

// Check if [aStart,aEnd) overlaps [bStart,bEnd)
function overlaps(aStart, aEnd, bStart, bEnd) {
  const s1 = normalizeDate(aStart);
  const e1 = normalizeDate(aEnd);
  const s2 = normalizeDate(bStart);
  const e2 = normalizeDate(bEnd);
  return s1 < e2 && e1 > s2;
}

// --- Public API ---

export function addBooking(payload) {
  const user = getCurrentUser();
  if (!user) throw new Error("Please log in before making a booking.");

  const s = new Date(payload.checkIn);
  const e = new Date(payload.checkOut);
  if (!(s < e)) throw new Error("checkOut must be after checkIn");

  const roomIdStr = String(payload.roomId);

  // Prevent overlaps across ALL users
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
  bookings = bookings.filter(
    (b) => !(b.id === Number(id) && b.email === user.email)
  );
}

// For calendar UI: return blocked ranges for a room
export function getBookedRanges(roomId) {
  const target = String(roomId);
  return bookings
    .filter((b) => String(b.roomId) === target)
    .map((b) => ({ start: b.checkIn, end: b.checkOut, bookingId: b.id }));
}

// Check availability for a specific room across ALL users
// exceptId lets you ignore one booking (for edits)
export function isRangeAvailable(roomId, checkIn, checkOut, exceptId = null) {
  const target = String(roomId);
  const s1 = normalizeDate(checkIn);
  const e1 = normalizeDate(checkOut);

  return !bookings.some((b) => {
    if (String(b.roomId) !== target) return false;
    if (exceptId != null && String(b.id) === String(exceptId)) return false;
    const s2 = normalizeDate(b.checkIn);
    const e2 = normalizeDate(b.checkOut);
    return s1 < e2 && e1 > s2;
  });
}
