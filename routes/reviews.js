const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: "Product ID and rating are required" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(409).json({ error: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.reviewCount = stats[0].count;
      await product.save();
    }

    const populated = await Review.findById(review._id).populate("user", "name");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const product = await Product.findById(productId);
    if (product) {
      if (stats.length > 0) {
        product.rating = Math.round(stats[0].avgRating * 10) / 10;
        product.reviewCount = stats[0].count;
      } else {
        product.rating = 0;
        product.reviewCount = 0;
      }
      await product.save();
    }

    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
