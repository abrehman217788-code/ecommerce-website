const express = require("express");
const User = require("../models/User");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.post("/wishlist", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch {
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

router.put("/:id/role", authenticate, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
