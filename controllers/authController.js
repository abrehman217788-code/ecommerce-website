const User = require("../models/User");
const { generateToken } = require("../utils/helpers");
const { AppError } = require("../utils/AppError");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError("Email already registered", 409);
  const user = await User.create({ name, email, password });
  const token = generateToken(user);
  res.status(201).json({ token, user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("Invalid email or password", 401);
  const match = await user.comparePassword(password);
  if (!match) throw new AppError("Invalid email or password", 401);
  const token = generateToken(user);
  res.json({ token, user });
};

exports.getMe = async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("No token", 401);
  }
  const jwt = require("jsonwebtoken");
  const env = require("../config/env");
  const decoded = jwt.verify(header.split(" ")[1], env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User not found", 404);
  res.json({ user });
};
