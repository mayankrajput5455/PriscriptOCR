import { db } from "../db";
import { users, emailVerifications } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendVerificationEmail } from "../lib/email";
import crypto from "crypto";
import { Router, Response } from "express";

const router = Router();

const runWithRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 200));
      return runWithRetry(fn, retries - 1);
    }
    throw err;
  }
};

export async function createAndSendVerification(email: string, name: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await runWithRetry(() =>
      db.delete(emailVerifications).where(eq(emailVerifications.email, normalizedEmail))
    );
    await runWithRetry(() =>
      db.insert(emailVerifications).values({ email: normalizedEmail, code, token, expiresAt })
    );
    await sendVerificationEmail({ to: normalizedEmail, name, code, token });
    return { success: true };
  } catch (err) {
    console.error("createAndSendVerification error:", err);
    return { success: false, error: "Failed to generate verification" };
  }
}

// POST /api/verification/verify
router.post("/verify", async (req, res: Response) => {
  const { email, code, token } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  try {
    let match = null;

    if (token) {
      const results = await runWithRetry(() =>
        db
          .select()
          .from(emailVerifications)
          .where(
            and(
              eq(emailVerifications.token, token),
              gt(emailVerifications.expiresAt, new Date())
            )
          )
          .limit(1)
      );
      match = results[0];
    } else if (normalizedEmail && code) {
      const results = await runWithRetry(() =>
        db
          .select()
          .from(emailVerifications)
          .where(
            and(
              eq(emailVerifications.email, normalizedEmail),
              eq(emailVerifications.code, code.trim()),
              gt(emailVerifications.expiresAt, new Date())
            )
          )
          .limit(1)
      );
      match = results[0];
    }

    if (!match) {
      res.status(400).json({ success: false, error: "Invalid or expired verification code." });
      return;
    }

    const verifiedEmail = match.email;

    await runWithRetry(() =>
      db.update(users).set({ emailVerified: true }).where(eq(users.email, verifiedEmail))
    );
    await runWithRetry(() =>
      db.delete(emailVerifications).where(eq(emailVerifications.email, verifiedEmail))
    );

    res.json({ success: true, email: verifiedEmail });
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Verification failed.",
    });
  }
});

// POST /api/verification/resend
router.post("/resend", async (req, res: Response) => {
  const email = req.body.email as string;
  if (!email) {
    res.status(400).json({ success: false, error: "Email is required" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const results = await runWithRetry(() =>
      db
        .select({ name: users.name, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, normalizedEmail))
    );
    const user = results[0];

    if (!user) {
      res.status(404).json({ success: false, error: "No account found with this email" });
      return;
    }
    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        error: "This email is already verified. You can sign in directly.",
      });
      return;
    }

    await createAndSendVerification(normalizedEmail, user.name);
    res.json({ success: true });
  } catch (err) {
    console.error("resendVerification error:", err);
    res.status(500).json({ success: false, error: "Failed to resend verification email" });
  }
});

export default router;
