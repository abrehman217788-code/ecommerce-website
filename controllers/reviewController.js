const Review = require("../models/Review");
const Product = require("../models/Product");
const { AppError } = require("../utils/AppError");

exports.getByProduct = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  res.json(reviews);
};

exports.create = async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw new AppError("You have already reviewed this product", 409);

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating, title, comment,
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
};

exports.remove = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Review not found", 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new AppError("Access denied", 403);
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
};
