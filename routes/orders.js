const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { items, shippingInfo, promoCode } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      const price = product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        quantity: item.quantity,
        price,
      });
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    let discount = 0;
    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (promo && promo.isValid(subtotal)) {
        discount = Math.round(subtotal * (promo.discountPercent / 100) * 100) / 100;
        await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
      }
    }
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      total,
      shippingInfo,
      promoCode: promoCode || null,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.put("/:id/status", authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.post("/:id/cancel", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }
    order.status = "cancelled";
    await order.save();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

module.exports = router;
