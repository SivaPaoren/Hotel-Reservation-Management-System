import { api } from "./client";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  _id: string;
  customer: string | { _id: string; name: string; email: string; age: number };
  hotelName: string;
  roomNumber: string;
  checkInDate: string;   // ISO string coming from backend
  checkOutDate: string;  // ISO string
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  customer: string;              // ObjectId
  hotelName: string;
  roomNumber: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  guests: number;
  totalPrice: number;
  status?: BookingStatus;
}

export interface UpdateBookingInput {
  customer?: string;
  hotelName?: string;
  roomNumber?: string;
  checkInDate?: string | Date;
  checkOutDate?: string | Date;
  guests?: number;
  totalPrice?: number;
  status?: BookingStatus;
}

export interface CreateBookingOptions {
  idempotencyKey?: string;
}

export async function listBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>("/api/bookings");
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/api/bookings/${id}`);
  return data;
}

export async function createBooking(
  body: CreateBookingInput,
  opts?: CreateBookingOptions
): Promise<Booking> {
  const headers =
    opts?.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : undefined;
  const { data } = await api.post<Booking>("/api/bookings", body, { headers });
  return data;
}

export async function updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking> {
  const { data } = await api.put<Booking>(`/api/bookings/${id}`, patch);
  return data;
}

export async function deleteBooking(id: string): Promise<{ message: string } | undefined> {
  const { data } = await api.delete<{ message: string }>(`/api/bookings/${id}`);
  return data; // backend returns {message} on success
}
