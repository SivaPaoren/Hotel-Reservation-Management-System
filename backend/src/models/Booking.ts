import mongoose, { Schema, Document, Types } from "mongoose";
import { ICustomer } from "./Customer.js"; // Import the Customer interface

export interface IBooking extends Document {
  customer: Types.ObjectId | ICustomer; // Reference to Customer
  hotelName: string;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
}

const BookingSchema: Schema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    hotelName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
