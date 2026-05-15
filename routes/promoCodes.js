const express = require("express");
const PromoCode = require("../models/PromoCode");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch {
    res.status(500).json({ error: "Failed to fetch promo codes" });
  }
});

router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const { code, discountPercent, maxUses, minOrderValue, expiresAt } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: "Code and discount are required" });
    }
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ error: "Code already exists" });
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountPercent,
      maxUses,
      minOrderValue,
      expiresAt: expiresAt || null,
    });
    res.status(201).json(promo);
  } catch {
    res.status(500).json({ error: "Failed to create promo code" });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });
    const promo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (!promo || !promo.isValid(orderTotal || 0)) {
      return res.status(400).json({ valid: false, error: "Invalid or expired code" });
    }
    res.json({ valid: true, discountPercent: promo.discountPercent, code: promo.code });
  } catch {
    res.status(500).json({ error: "Failed to validate code" });
  }
});

router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promo) return res.status(404).json({ error: "Promo code not found" });
    res.json(promo);
  } catch {
    res.status(500).json({ error: "Failed to update promo code" });
  }
});

router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ error: "Promo code not found" });
    res.json({ message: "Promo code deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete promo code" });
  }
});

module.exports = router;
