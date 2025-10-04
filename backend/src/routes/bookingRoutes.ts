import express, { Request, Response } from "express";
import { Booking, IBooking } from "../models/Booking.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
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
  try {
    const {
      customer,
      hotelName,
      roomNumber,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      status,
    } = req.body as Partial<IBooking>;

    // Basic validation
    if (!customer || !hotelName || !roomNumber || !checkInDate || !checkOutDate || !guests || totalPrice == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const inDate = new Date(checkInDate as any);
    const outDate = new Date(checkOutDate as any);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return res.status(400).json({ message: "Invalid dates." });
    }
    if (outDate <= inDate) {
      return res.status(400).json({ message: "checkOutDate must be after checkInDate." });
    }

    // Idempotency: if a client sends an identical booking again, return existing
    const maybeDuplicate = await Booking.findOne({
      customer,
      roomNumber,
      checkInDate: inDate,
      checkOutDate: outDate,
    });
    if (maybeDuplicate) {
      return res.status(201).json(maybeDuplicate);
    }

    // Overlap guard (non-cancelled only):
    // [existing.checkIn, existing.checkOut) intersects [inDate, outDate)
    const overlap = await Booking.findOne({
      roomNumber,
      status: { $ne: "cancelled" },
      checkInDate: { $lt: outDate },
      checkOutDate: { $gt: inDate },
    }).lean();

    if (overlap) {
      return res.status(409).json({ message: "Room not available for the selected dates." });
    }

    const created = await Booking.create({
      customer,
      hotelName,
      roomNumber,
      checkInDate: inDate,
      checkOutDate: outDate,
      guests,
      totalPrice,
      status: status ?? "pending",
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    // If dates or roomNumber are being changed, enforce overlap check again
    const patch = req.body as Partial<IBooking>;
    let inDate: Date | undefined;
    let outDate: Date | undefined;

    if (patch.checkInDate) inDate = new Date(patch.checkInDate as any);
    if (patch.checkOutDate) outDate = new Date(patch.checkOutDate as any);

    if (inDate && isNaN(inDate.getTime())) {
      return res.status(400).json({ message: "Invalid checkInDate." });
    }
    if (outDate && isNaN(outDate.getTime())) {
      return res.status(400).json({ message: "Invalid checkOutDate." });
    }
    if (inDate && outDate && outDate <= inDate) {
      return res.status(400).json({ message: "checkOutDate must be after checkInDate." });
    }

    // Load current to know roomNumber/dates if not provided in patch
    const current = await Booking.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Booking not found" });

    const roomNumber = patch.roomNumber ?? current.roomNumber;
    const ci = inDate ?? current.checkInDate;
    const co = outDate ?? current.checkOutDate;

    // If anything that affects availability changed, re-check overlap
    const affectsAvailability =
      patch.roomNumber !== undefined || patch.checkInDate !== undefined || patch.checkOutDate !== undefined;

    if (affectsAvailability) {
      const overlap = await Booking.findOne({
        _id: { $ne: current._id },
        roomNumber,
        status: { $ne: "cancelled" },
        checkInDate: { $lt: co },
        checkOutDate: { $gt: ci },
      }).lean();

      if (overlap) {
        return res.status(409).json({ message: "Room not available for the selected dates." });
      }
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...patch, checkInDate: ci, checkOutDate: co },
      { new: true }
    );

    res.json(updated);
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
