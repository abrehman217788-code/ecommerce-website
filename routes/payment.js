const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeSecretKey && stripeSecretKey.startsWith("sk_")) {
  stripe = require("stripe")(stripeSecretKey);
}

router.post("/create-payment-intent", authenticate, async (req, res) => {
  try {
    const { items, promoCode } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
    }

    const discount = promoCode === "SAVE20" ? subtotal * 0.2 : 0;
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal - discount + shipping;
    const amountInCents = Math.round(total * 100);

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: { userId: req.user._id.toString(), promoCode: promoCode || "" },
      });
      return res.json({ clientSecret: paymentIntent.client_secret, total, subtotal, discount, shipping });
    }

    res.json({ clientSecret: null, total, subtotal, discount, shipping });
  } catch (err) {
    console.error("Payment intent error:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

router.post("/confirm", authenticate, async (req, res) => {
  try {
    const { items, shippingInfo, promoCode, paymentIntentId } = req.body;
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

    const discount = promoCode === "SAVE20" ? subtotal * 0.2 : 0;
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal - discount + shipping;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      total,
      shippingInfo,
      promoCode,
      paymentIntentId: paymentIntentId || null,
      status: "confirmed",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order confirm error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

module.exports = router;
