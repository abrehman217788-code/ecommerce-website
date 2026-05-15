const crypto = require("crypto");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const { sendPasswordResetEmail } = require("../utils/email");

const resetTokens = new Map();

exports.forgot = async (req, res) => {
  const { email } = req.body;
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

  await sendPasswordResetEmail(email, token);
  res.json({ message: "If that email exists, a reset link has been sent." });
};

exports.reset = async (req, res) => {
  const { token, email, password } = req.body;
  if (password.length < 8) throw new AppError("Password must be at least 8 characters", 400);

  const entry = resetTokens.get(token);
  if (!entry || entry.email !== email.toLowerCase()) {
    throw new AppError("Invalid or expired token", 400);
  }
  if (Date.now() > entry.expires) {
    resetTokens.delete(token);
    throw new AppError("Token has expired", 400);
  }

  const user = await User.findById(entry.userId);
  if (!user) throw new AppError("User not found", 404);

  user.password = password;
  await user.save();
  resetTokens.delete(token);

  res.json({ message: "Password reset successfully" });
};
