import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    res.locals.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "your_secret_key");
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
