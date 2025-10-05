import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http");

import roomRoutes from "./routes/roomRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

/** Let Express trust proxy headers from Nginx */
app.set("trust proxy", 1);

/** Configure CORS with an allowlist for multiple origins */
const allowedOrigins = env.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin or tools like curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// API routes
app.use("/api/rooms", roomRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
