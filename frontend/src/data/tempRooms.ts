// src/data/tempRooms.ts
// In-memory CRUD for rooms, seeded from mockRooms.

import type { Room } from "../lib/types";
import { mockRooms as seedRooms } from "./mockRooms";

function genId() {
  return "r_" + Math.random().toString(36).slice(2, 10);
}

// Make sure we always conform to Room interface
function normalize(x: any): Room {
  return {
    id: String(x.id ?? genId()),
    roomNumber: String(x.roomNumber ?? "000"),
    price: Number(x.price ?? x.basePrice ?? 0),
    type: String(x.type ?? "STANDARD") as any, // adjust enum if needed
    number: Number(x.number ?? 1),
    basePrice: Number(x.basePrice ?? x.price ?? 0),
    amenities: Array.isArray(x.amenities) ? x.amenities.map(String) : [],
    status: String(x.status ?? "AVAILABLE") as any, // adjust enum if needed
    images: Array.isArray(x.images) ? x.images.map(String) : [],
    description: x.description ? String(x.description) : undefined,
    createdAt: x.createdAt ?? new Date().toISOString(),
    updatedAt: x.updatedAt ?? new Date().toISOString(),
  };
}

let rooms: Room[] = (Array.isArray(seedRooms) ? seedRooms : []).map(normalize);

export function listRooms(): Room[] {
  return rooms.map((r) => ({ ...r }));
}

export function getRoomById(id: string): Room | undefined {
  const r = rooms.find((x) => x.id === id);
  return r ? { ...r } : undefined;
}

export function createRoom(input: Omit<Room, "id" | "createdAt" | "updatedAt"> & { id?: string }): Room {
  const now = new Date().toISOString();
  const r: Room = normalize({
    ...input,
    id: input.id ?? genId(),
    createdAt: now,
    updatedAt: now,
  });
  rooms.push(r);
  return { ...r };
}

export function updateRoom(
  id: string,
  patch: Partial<Omit<Room, "id" | "createdAt">>
): Room | null {
  const idx = rooms.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const merged: Room = normalize({ ...rooms[idx], ...patch, id, updatedAt: now });
  rooms[idx] = merged;
  return { ...merged };
}

export function deleteRoom(id: string): boolean {
  const n = rooms.length;
  rooms = rooms.filter((x) => x.id !== id);
  return rooms.length !== n;
}

export function _resetRooms(next?: Room[]) {
  rooms = next ? next.map(normalize) : (Array.isArray(seedRooms) ? seedRooms : []).map(normalize);
}
