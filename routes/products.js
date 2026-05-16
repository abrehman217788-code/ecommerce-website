const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, adminOnly } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");
const { productRules, handleValidation } = require("../middleware/validate");

router.get("/", catchAsync(productController.list));
router.get("/:id", catchAsync(productController.getById));
router.post("/", authenticate, adminOnly, productRules, handleValidation, catchAsync(productController.create));
router.put("/:id", authenticate, adminOnly, productRules, handleValidation, catchAsync(productController.update));
router.delete("/:id", authenticate, adminOnly, catchAsync(productController.remove));

module.exports = router;
