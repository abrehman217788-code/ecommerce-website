const env = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  try {
    const nodemailer = require("nodemailer");
    if (env.SMTP_USER && env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
  } catch {}
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({ from: env.FROM_EMAIL, to, subject, html });
    return true;
  } catch {
    console.warn("Failed to send email to", to);
    return false;
  }
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  return sendEmail({
    to: email,
    subject: "VELORA - Password Reset Request",
    html: `<div style="max-width:480px;margin:40px auto;padding:32px;background:#1a1a1a;border-radius:12px;color:#f5f0e8;font-family:sans-serif">
      <h2 style="font-family:serif;color:#6c5ce7">VELORA</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:#fff;border-radius:999px;text-decoration:none;margin:16px 0">Reset Password</a>
      <p style="color:rgba(245,240,232,0.4);font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>`,
  });
}

module.exports = { sendEmail, sendPasswordResetEmail };
