import express from "express";
import roomRoutes from "./roomRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import customerRoutes from "./customerRoutes.js";
import { checkAdmin } from "../middleware/checkAdmin.js";

const router = express.Router();

// API healthcheck
router.get("/v1/hello", (_req, res) => {
  res.json({ hello: "world" });
});

// API groups
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/customers", customerRoutes);

// Admin ping (used for login validation)
router.get("/admin/ping", checkAdmin, (_req, res) => {
  res.sendStatus(204);
});

export default router;
