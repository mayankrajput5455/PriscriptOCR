import nodemailer from "nodemailer";

function getTransporter() {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const cleanUser = process.env.GMAIL_USER.trim();
    const cleanPass = process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "");
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: cleanUser, pass: cleanPass },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
    });
  }

  return null;
}

export async function sendVerificationEmail({
  to,
  name,
  code,
  token,
}: {
  to: string;
  name: string;
  code: string;
  token: string;
}) {
  const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyLink = `${appUrl}/verify?token=${token}&email=${encodeURIComponent(to)}`;

  const transporter = getTransporter();

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL VERIFICATION] To: ${to} (${name})`);
  console.log(`🔑 6-Digit OTP Code: >>> ${code} <<<`);
  console.log(`🔗 1-Click Link: ${verifyLink}`);
  console.log(`======================================================\n`);

  if (!transporter) {
    console.warn("[Email Service] No SMTP credentials configured. Email details printed above.");
    return { success: true, simulated: true };
  }

  const senderEmail = process.env.GMAIL_USER?.trim() || process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 12px; margin-bottom: 8px; }
          .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #0f172a; border: 1px dashed #38bdf8; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; font-family: monospace; }
          .otp-note { font-size: 12px; color: #64748b; margin-top: 6px; }
          .btn-container { text-align: center; margin-bottom: 24px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }
          .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PrescriptOCR</div>
            <div class="title">Verify Your Doctor Account</div>
          </div>
          <p class="text">
            Hello <strong>${name}</strong>,<br>
            Thank you for registering your clinic with PrescriptOCR. Use the 6-digit verification code below or click the direct button to verify your email address.
          </p>
          <div class="otp-box">
            <div class="otp-code">${code}</div>
            <div class="otp-note">Valid for 15 minutes</div>
          </div>
          <div class="btn-container">
            <a href="${verifyLink}" class="btn">Verify Account Directly</a>
          </div>
          <p class="text" style="font-size: 12px;">
            If you did not sign up for PrescriptOCR, please disregard this email.
          </p>
          <div class="footer">
            PrescriptOCR AI Medical Intelligence &bull; Secured with HIPAA Compliant Cloud
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Hello ${name},\n\nYour PrescriptOCR verification code is: ${code}\n\nThis code is valid for 15 minutes.\n\nOr verify directly:\n${verifyLink}\n\nPrescriptOCR AI Medical Intelligence`;

  try {
    const info = await transporter.sendMail({
      from: `"PrescriptOCR" <${senderEmail}>`,
      to,
      subject: `PrescriptOCR Verification Code: ${code}`,
      text: textContent,
      html,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        Importance: "High",
      },
    });
    console.log(`[Email Service] Successfully sent verification email to ${to} (MessageId: ${info.messageId})`);
    return { success: true };
  } catch (err) {
    console.error("[Email Service] Failed to send email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to send email" };
  }
}
