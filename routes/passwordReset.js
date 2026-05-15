const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router();

const resetTokens = new Map();

function sendResetEmail(email, token) {
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    transporter.sendMail({
      from: process.env.FROM_EMAIL || "noreply@velora.com",
      to: email,
      subject: "VELORA - Password Reset Request",
      html: `
        <div style="max-width:480px;margin:40px auto;padding:32px;background:#1a1a1a;border-radius:12px;color:#f5f0e8;font-family:sans-serif">
          <h2 style="font-family:serif;color:#6c5ce7">VELORA</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:#fff;border-radius:999px;text-decoration:none;margin:16px 0">Reset Password</a>
          <p style="color:rgba(245,240,232,0.4);font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    }).catch(() => {});
  } catch {}
}

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, {
      email: email.toLowerCase(),
      userId: user._id.toString(),
      expires: Date.now() + 3600000,
    });

    sendResetEmail(email, token);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch {
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const entry = resetTokens.get(token);
    if (!entry || entry.email !== email.toLowerCase()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
    if (Date.now() > entry.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const user = await User.findById(entry.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = password;
    await user.save();

    resetTokens.delete(token);
    res.json({ message: "Password reset successfully" });
  } catch {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;
