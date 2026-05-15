const Order = require("../models/Order");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
const { AppError } = require("../utils/AppError");
const { calculateDiscount, calculateShipping, calculateTotal } = require("../utils/helpers");

exports.list = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
};

exports.getById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) throw new AppError("Order not found", 404);
  if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
    throw new AppError("Access denied", 403);
  }
  res.json(order);
};

exports.create = async (req, res) => {
  const { items, shippingInfo, promoCode } = req.body;
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
  });

  res.status(201).json(order);
};

exports.updateStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) throw new AppError("Order not found", 404);
  res.json(order);
};

exports.cancel = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);
  if (req.user.role !== "admin" && order.user.toString() !== req.user._id.toString()) {
    throw new AppError("Access denied", 403);
  }
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new AppError("Order cannot be cancelled at this stage", 400);
  }
  order.status = "cancelled";
  await order.save();
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  res.json(order);
};
