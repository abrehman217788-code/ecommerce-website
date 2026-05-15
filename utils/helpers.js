const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

function calculateDiscount(subtotal, discountPercent) {
  return Math.round(subtotal * (discountPercent / 100) * 100) / 100;
}

function calculateShipping(subtotal) {
  return subtotal >= 100 ? 0 : 9.99;
}

function calculateTotal(subtotal, discount, shipping) {
  return Math.round((subtotal - discount + shipping) * 100) / 100;
}

module.exports = {
  generateToken,
  extractToken,
  sanitizeUser,
  calculateDiscount,
  calculateShipping,
  calculateTotal,
};
