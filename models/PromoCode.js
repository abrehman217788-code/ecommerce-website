const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  isActive: { type: Boolean, default: true },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  minOrderValue: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

promoSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  if (orderTotal < this.minOrderValue) return false;
  return true;
};

module.exports = mongoose.model("PromoCode", promoSchema);
