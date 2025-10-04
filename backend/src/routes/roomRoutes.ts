import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Room } from "../models/Room.js";
import { Booking } from "../models/Booking.js";

const router = Router();

/**
 * GET /api/rooms
 * Optional query: status, type
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query as { status?: string; type?: string };
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const rooms = await Room.find(filter).sort({ room_number: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/rooms  (OPEN)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { room_number, type, base_price, amenities, status } = req.body;
    if (!room_number || !type || base_price == null) {
      return res.status(400).json({
        error: "room_number, type, and base_price are required",
      });
    }

    const newRoom = await Room.create({
      room_number,
      type,
      base_price,
      amenities: Array.isArray(amenities) ? amenities : [],
      status: status ?? "available",
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/rooms/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PUT /api/rooms/:id  (OPEN)
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }
    const updated = await Room.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Room not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

/**
 * DELETE /api/rooms/:id  (OPEN, but blocked if there are bookings)
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }

    // Block deletion if room is referenced by any bookings
    const inUse = await Booking.countDocuments({ room: id });
    if (inUse > 0) {
      return res
        .status(409)
        .json({ error: "Room has existing bookings. Set it unavailable or move bookings first." });
    }

    const deleted = await Room.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Room not found" });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
