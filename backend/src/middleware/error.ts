import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: err.errors.map(e => ({ path: e.path, message: e.message })),
    });
  }

  res.status(500).json({ error: "InternalServerError" });
}
