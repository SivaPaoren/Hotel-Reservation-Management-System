// src/lib/types.ts

export type Id = string;
export type ISODate = string;

// ---- UI Room (mapped from API) ----
export type RoomType = "single" | "double" | "suite";
export type RoomStatus = "available" | "unavailable";

/**
 * UI-facing Room shape used across components.
 * We map API { _id, room_number, base_price, ... } -> this.
 */
export interface Room {
  id: Id;                       // mapped from _id
  number: string | number;      // mapped from room_number
  type: RoomType;
  amenities: string[];
  price: number;                // mapped from base_price
  status?: RoomStatus;          // optional: we sometimes ignore status
  description?: string;
  images?: string[];
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

/**
 * Tip: for Customers/Bookings, import the typed shapes
 * from src/api/customers and src/api/bookings directly.
 * (Avoid duplicating them here to prevent drift.)
 */
