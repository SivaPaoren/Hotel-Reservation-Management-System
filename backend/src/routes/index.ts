import { Router } from "express";
import { z } from "zod";

export const router = Router();

router.get("/v1/hello", (_req, res) => {
  res.json({ hello: "world" });
});

const echoSchema = z.object({ message: z.string().min(1) });

router.post("/v1/echo", (req, res, next) => {
  try {
    const data = echoSchema.parse(req.body);
    res.json({ received: data.message });
  } catch (err) {
    next(err);
  }
});
