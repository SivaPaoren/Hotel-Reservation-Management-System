import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { router as api } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import customerRoutes from "./routes/customerRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

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

app.use("/api", api);
app.use("/api/customers", customerRoutes);
app.use('/rooms', roomRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
