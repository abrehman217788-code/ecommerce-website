const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");
const { reviewRules, handleValidation } = require("../middleware/validate");

router.get("/product/:productId", catchAsync(reviewController.getByProduct));
router.post("/", authenticate, reviewRules, handleValidation, catchAsync(reviewController.create));
router.delete("/:id", authenticate, catchAsync(reviewController.remove));

module.exports = router;
