// src/lib/types.ts

export type Id = string;
export type ISODate = string;

// ---- Room ----
export type RoomType = "single" | "double" | "suite";
export type RoomStatus = "available" | "unavailable";

export interface Room {
  id: Id;
  roomNumber: string;      // e.g. "305"
  price: number; 
  type: RoomType;
  number: number;
  basePrice: number;       // nightly base price (THB)
  amenities: string[];     // ["Wi-Fi","AC","TV"]
  status: RoomStatus;
  images?: string[];
  description?: string;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

// ---- Customer ----
export interface Customer {
  id: Id;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  createdAt?: ISODate;
}

// ---- Booking ----
export type BookingStatus = "confirmed" | "cancelled" | "completed";

// We’ll use [checkIn, checkOut) semantics (exclusive end) for overlap checks.
export interface Booking {
  id: Id;
  roomId: Id;
  customerId: Id;
  checkIn: ISODate;        // inclusive start
  checkOut: ISODate;       // exclusive end
  nights: number;          // derived
  pricePerNight: number;   // after pricing engine
  totalPrice: number;      // nights * pricePerNight
  status: BookingStatus;
  createdAt?: ISODate;
}

// ---- DTOs (for forms/API) ----
export interface CreateBookingInput {
  roomId: Id;
  customerId: Id;
  checkIn: ISODate;
  checkOut: ISODate;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
}
