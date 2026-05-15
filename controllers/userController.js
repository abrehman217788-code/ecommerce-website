const User = require("../models/User");
const { AppError } = require("../utils/AppError");

exports.list = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

exports.getProfile = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ user });
};

exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
};

exports.updateRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
  if (!user) throw new AppError("User not found", 404);
  res.json({ user });
};
