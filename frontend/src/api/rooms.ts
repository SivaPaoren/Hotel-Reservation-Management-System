import { api } from "./client";

export type RoomType = "single" | "double" | "suite";
export type RoomStatus = "available" | "unavailable";

export interface Room {
  _id: string;
  room_number: string;
  type: RoomType;
  base_price: number;
  amenities: string[];
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomInput {
  room_number: string;
  type: RoomType;
  base_price: number;
  amenities?: string[];
  status?: RoomStatus;
}

export interface UpdateRoomInput {
  room_number?: string;
  type?: RoomType;
  base_price?: number;
  amenities?: string[];
  status?: RoomStatus;
}

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
