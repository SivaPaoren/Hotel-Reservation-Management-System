import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  CORS_ORIGIN: z.string().default("*"),
  // MONGO_URI: z.string().url(),
});


// console.log("process.env.MONGO_URI:", process.env.MONGO_URI);

export const env = EnvSchema.parse(process.env);
