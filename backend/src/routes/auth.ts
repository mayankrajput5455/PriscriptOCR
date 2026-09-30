import { Router, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword, verifyPassword, signJWT, setAuthCookie, clearAuthCookie } from "../lib/auth";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { createAndSendVerification } from "./verification";

const router = Router();

const SignupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters").default("My Clinic"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/signup
router.post("/signup", async (req, res: Response) => {
  const raw = {
    name: req.body.name as string,
    email: req.body.email as string,
    clinicName: req.body.clinicName || "My Clinic",
    password: req.body.password as string,
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const { name, email, clinicName, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [existing] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (existing) {
      if (!existing.emailVerified) {
        await createAndSendVerification(normalizedEmail, name.trim());
        res.json({
          success: true,
          email: normalizedEmail,
          message: "Account exists but is unverified. A new verification code has been sent.",
        });
        return;
      }
      res.status(400).json({ success: false, error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        clinicName: clinicName.trim(),
        role: "doctor",
        emailVerified: false,
      })
      .returning();

    await createAndSendVerification(newUser.email, newUser.name);
    res.json({ success: true, email: newUser.email });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Signup failed. Please try again.",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res: Response) => {
  const raw = {
    email: req.body.email as string,
    password: req.body.password as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));

    if (!user) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({
        success: false,
        error: "This account was registered with Google. Please use 'Continue with Google'.",
      });
      return;
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    if (!user.emailVerified) {
      await createAndSendVerification(user.email, user.name);
      res.status(403).json({
        success: false,
        unverified: true,
        email: user.email,
        error: "Your email is not verified yet. We just sent a fresh verification code to your inbox.",
      });
      return;
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      clinicName: user.clinicName,
      role: user.role,
    });

    setAuthCookie(res, token);
    res.json({
      success: true,
      token,
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        clinicName: user.clinicName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Login failed. Please try again.",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

// GET /api/auth/google
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "Google OAuth is not configured" });
    return;
  }
  const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
  const from = (req.query.from as string) || "/dashboard";
  const state = Buffer.from(JSON.stringify({ from })).toString("base64");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&prompt=consent`;

  res.redirect(authUrl);
});

// GET /api/auth/google/callback
router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  let target = "/dashboard";
  try {
    if (state) {
      const parsed = JSON.parse(Buffer.from(state as string, "base64").toString("utf-8"));
      if (parsed.from) target = parsed.from;
    }
  } catch {}

  if (!code) {
    res.redirect(`${frontendUrl}/login?error=Google authentication failed`);
    return;
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      res.redirect(`${frontendUrl}/login?error=Failed to retrieve Google token`);
      return;
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userRes.json()) as any;
    const email = profile.email?.toLowerCase()?.trim();
    if (!email) {
      res.redirect(`${frontendUrl}/login?error=Failed to retrieve email from Google`);
      return;
    }

    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          name: profile.name || "Doctor",
          email,
          googleId: profile.sub,
          avatarUrl: profile.picture,
          emailVerified: true,
          clinicName: "My Clinic",
          role: "doctor",
        })
        .returning();
    } else {
      if (!user.emailVerified || !user.googleId) {
        await db
          .update(users)
          .set({
            emailVerified: true,
            googleId: profile.sub,
            avatarUrl: profile.picture || user.avatarUrl,
          })
          .where(eq(users.id, user.id));
      }
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      clinicName: user.clinicName,
      role: user.role,
    });

    setAuthCookie(res, token);
    const separator = target.includes("?") ? "&" : "?";
    res.redirect(`${frontendUrl}${target}${separator}token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google auth callback error:", err);
    res.redirect(`${frontendUrl}/login?error=Google authentication failed`);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

export default router;
