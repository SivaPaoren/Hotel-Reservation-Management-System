import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";

// ✅ robust require for pino-http under NodeNext
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http");

import roomRoutes from "./routes/roomRoutes.js";          // Rooms CRUD (default export)
import customerRoutes from "./routes/customerRoutes.js";  // default export
import bookingRoutes from "./routes/bookingRoutes.js";    // default export

import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ no TS nonsense here
app.use(pinoHttp());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// API mounts
app.use("/api/rooms", roomRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

export default app;
