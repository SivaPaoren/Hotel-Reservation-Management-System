import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  CORS_ORIGIN: z.string().default("*"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
});

export const env = EnvSchema.parse(process.env);
