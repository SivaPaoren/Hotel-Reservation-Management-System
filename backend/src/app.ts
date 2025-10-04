import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
// ❌ remove: import adminRoutes from "./routes/adminRoutes.js";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http");

import roomRoutes from "./routes/roomRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// API mounts (OPEN)
app.use("/api/rooms", roomRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);

// ❌ remove: app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
