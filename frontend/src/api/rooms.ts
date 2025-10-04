// frontend/src/api/rooms.ts
import { api } from "./client";

export type RoomType = "single" | "double" | "suite" | string;
export type RoomStatus = "available" | "unavailable" | string;

export interface Room {
  _id: string;
  room_number: string;
  type: RoomType;
  base_price: number;
  amenities?: string[];     // ← optional (Mongo docs may omit)
  status: RoomStatus;
  createdAt?: string;       // ← optional
  updatedAt?: string;       // ← optional
}

export interface CreateRoomInput {
  room_number: string;
  type: RoomType;
  base_price: number;
  amenities?: string[];
  status?: RoomStatus;
}

export type UpdateRoomInput = Partial<CreateRoomInput>;

export async function listRooms(params?: { status?: RoomStatus; type?: RoomType }): Promise<Room[]> {
  const { data } = await api.get<Room[]>("/api/rooms", { params });
  return data;
}

export async function getRoom(id: string): Promise<Room> {
  const { data } = await api.get<Room>(`/api/rooms/${id}`);
  return data;
}

export async function createRoom(body: CreateRoomInput): Promise<Room> {
  const { data } = await api.post<Room>("/api/rooms", body);
  return data;
}

export async function updateRoom(id: string, patch: UpdateRoomInput): Promise<Room> {
  const { data } = await api.put<Room>(`/api/rooms/${id}`, patch);
  return data;
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/api/rooms/${id}`);
}
