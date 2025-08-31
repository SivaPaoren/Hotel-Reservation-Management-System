import "dotenv/config"; 
import http from "node:http";
import { pino } from "pino";
import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./db.js";

  const isDev = env.NODE_ENV === "development";

  const logger = pino(
    isDev
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : {} // plain JSON logs in production
  );

  const server = http.createServer(app);

  async function start() {
    try {
      await connectDB(); // ⬅️ Connect to MongoDB first
      server.listen(env.PORT, () => {
        logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
      });
    } catch (err) {
      logger.error(err, "❌ Failed to connect to MongoDB");
      process.exit(1);
    }
  }

  start();

  function shutdown(signal: NodeJS.Signals) {
    logger.info(`${signal} received. Closing server...`);
    server.close(err => {
      if (err) {
        logger.error(err, "Error during server close");
        process.exit(1);
      }
      logger.info("Server closed. Bye!");
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
