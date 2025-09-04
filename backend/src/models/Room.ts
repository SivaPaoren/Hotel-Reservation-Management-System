import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  room_number: string;
  type: "single" | "double" | "suite";
  base_price: number;
  amenities: string[];
  status: "available" | "unavailable";
}

const RoomSchema: Schema = new Schema(
  {
    room_number: { type: String, required: true, unique: true },
    type: { type: String, enum: ["single", "double", "suite"], required: true },
    base_price: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    status: { type: String, enum: ["available", "unavailable"], default: "available" },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
