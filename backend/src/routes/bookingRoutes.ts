import express, { Request, Response } from "express";
import { Booking, IBooking } from "../models/Booking.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().populate("customer", "name email age");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("customer", "name email age");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const bookingData: Partial<IBooking> = req.body;
  const booking = new Booking(bookingData);

  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
