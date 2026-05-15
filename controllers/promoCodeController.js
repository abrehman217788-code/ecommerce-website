const PromoCode = require("../models/PromoCode");
const { AppError } = require("../utils/AppError");

exports.list = async (req, res) => {
  const codes = await PromoCode.find().sort({ createdAt: -1 });
  res.json(codes);
};

exports.create = async (req, res) => {
  const { code, discountPercent, maxUses, minOrderValue, expiresAt } = req.body;
  const existing = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existing) throw new AppError("Code already exists", 409);
  const promo = await PromoCode.create({
    code: code.toUpperCase(),
    discountPercent,
    maxUses: maxUses || null,
    minOrderValue: minOrderValue || 0,
    expiresAt: expiresAt || null,
  });
  res.status(201).json(promo);
};

exports.validate = async (req, res) => {
  const { code, orderTotal } = req.body;
  const promo = await PromoCode.findOne({ code: code.toUpperCase() });
  if (!promo || !promo.isValid(orderTotal || 0)) {
    return res.json({ valid: false, error: "Invalid or expired code" });
  }
  res.json({ valid: true, discountPercent: promo.discountPercent, code: promo.code });
};

exports.update = async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!promo) throw new AppError("Promo code not found", 404);
  res.json(promo);
};

exports.remove = async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id);
  if (!promo) throw new AppError("Promo code not found", 404);
  res.json({ message: "Promo code deleted" });
};
