const { body, param, query, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const productRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

const reviewRules = [
  body("productId").isMongoId().withMessage("Valid product ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("title").optional().trim().isLength({ max: 100 }),
  body("comment").optional().trim().isLength({ max: 2000 }),
];

const promoCodeRules = [
  body("code").trim().notEmpty().withMessage("Code is required"),
  body("discountPercent").isInt({ min: 1, max: 100 }).withMessage("Discount must be 1-100"),
];

const orderRules = [
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.productId").isMongoId().withMessage("Valid product ID required"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const shippingRules = [
  body("shippingInfo.name").trim().notEmpty().withMessage("Shipping name is required"),
  body("shippingInfo.email").isEmail().withMessage("Valid shipping email is required"),
  body("shippingInfo.address").trim().notEmpty().withMessage("Address is required"),
  body("shippingInfo.city").trim().notEmpty().withMessage("City is required"),
];

const forgotPasswordRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Token is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  productRules,
  reviewRules,
  promoCodeRules,
  orderRules,
  shippingRules,
  forgotPasswordRules,
  resetPasswordRules,
};
