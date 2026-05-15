const Order = require("../models/Order");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { AppError } = require("../utils/AppError");
const { calculateDiscount, calculateShipping, calculateTotal } = require("../utils/helpers");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeSecretKey && stripeSecretKey.startsWith("sk_")) {
  stripe = require("stripe")(stripeSecretKey);
}

exports.createPaymentIntent = async (req, res) => {
  const { items, promoCode } = req.body;
  if (!items || items.length === 0) throw new AppError("Cart is empty", 400);

  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
    subtotal += product.price * item.quantity;
  }

  let discount = 0;
  if (promoCode) {
    const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
    if (promo && promo.isValid(subtotal)) {
      discount = calculateDiscount(subtotal, promo.discountPercent);
    }
  }

  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, discount, shipping);
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
};

exports.confirmOrder = async (req, res) => {
  const { items, shippingInfo, promoCode, paymentIntentId } = req.body;
  if (!items || items.length === 0) throw new AppError("Cart is empty", 400);

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      productName: product.name,
      productImage: product.image,
      quantity: item.quantity,
      price: product.price,
    });
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
  }

  let discount = 0;
  if (promoCode) {
    const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
    if (promo && promo.isValid(subtotal)) {
      discount = calculateDiscount(subtotal, promo.discountPercent);
      await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
    }
  }

  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, discount, shipping);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    subtotal, discount, shipping, total,
    shippingInfo,
    promoCode: promoCode || null,
    paymentIntentId: paymentIntentId || null,
    status: "confirmed",
  });

  res.status(201).json(order);
};
