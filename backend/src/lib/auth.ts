import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Request, Response } from "express";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "prescriptocr-secure-jwt-super-secret-key-2025"
);

export const AUTH_COOKIE_NAME = "prescriptocr_token";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  clinicName: string;
  role: string;
}

// ─── Password Hashing ────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT Tokens ─────────────────────────────────────────────────────────────

export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session Helpers ─────────────────────────────────────────────────────────

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}

export async function getCurrentUser(req: Request): Promise<SessionPayload | null> {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) return null;
    const payload = await verifyJWT(token);
    if (!payload?.userId) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      clinicName: payload.clinicName || "My Clinic",
      role: payload.role || "doctor",
    };
  } catch {
    return null;
  }
}
