const express = require("express");
const Product = require("../models/Product");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    let sortOpt = { createdAt: -1 };
    if (sort === "price-asc") sortOpt = { price: 1 };
    else if (sort === "price-desc") sortOpt = { price: -1 };
    else if (sort === "rating") sortOpt = { rating: -1 };
    else if (sort === "name") sortOpt = { name: 1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOpt)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
