const Product = require("../models/Product");
const { AppError } = require("../utils/AppError");

exports.list = async (req, res) => {
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
};

exports.getById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json(product);
};

exports.create = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

exports.update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json(product);
};

exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json({ message: "Product deleted" });
};
