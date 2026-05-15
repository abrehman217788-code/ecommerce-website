const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  category: { type: String, required: true, index: true },
  image: { type: String, default: "" },
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 },
  badge: { type: String, enum: ["", "new", "sale", "bestseller"], default: "" },
  colors: [{ name: String, hex: String }],
  sizes: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model("Product", productSchema);
