import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Room } from "../models/Room.js"; // <-- adjust the path if your models folder is elsewhere

const router = Router();

/**
 * GET /api/rooms
 * List all rooms (optionally filter by status or type)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;

    // Build a simple filter object from query params
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const rooms = await Room.find(filter).sort({ room_number: 1 });
    res.json(rooms); // 200 OK by default
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/rooms
 * Create a new room
 * Body example:
 * {
 *   "room_number": "101A",
 *   "type": "single",
 *   "base_price": 1500,
 *   "amenities": ["Wi-Fi","AC","TV"],
 *   "status": "available"
 * }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Minimal manual validation (you can add a library like zod or joi later)
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

    res.status(201).json(newRoom); // 201 Created
  } catch (err) {
    // Common creation errors: duplicate room_number, bad enum values, etc.
    res.status(400).json({ error: (err as Error).message });
  }
});

/**
 * GET /api/rooms/:id
 * Get a single room by its MongoDB _id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate that :id looks like a MongoDB ObjectId
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
 * PUT /api/rooms/:id
 * Update an existing room (full or partial)
 * Body can include any of the model fields
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }

    // { new: true } returns the updated document
    // runValidators: true makes Mongoose re-check schema rules on update
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
 * DELETE /api/rooms/:id
 * Remove a room by its id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }

    const deleted = await Room.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Room not found" });

    // 204 No Content = success with nothing in the body
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
