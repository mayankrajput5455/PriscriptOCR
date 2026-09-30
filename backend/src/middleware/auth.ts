import { Request, Response, NextFunction } from "express";
import { getCurrentUser, SessionPayload } from "../lib/auth";

export interface AuthRequest extends Request {
  user?: SessionPayload;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized. Please log in." });
    return;
  }
  req.user = user;
  next();
}
