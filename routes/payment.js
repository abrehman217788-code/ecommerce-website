const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");
const { orderRules, shippingRules, handleValidation } = require("../middleware/validate");

router.post("/create-payment-intent", authenticate, catchAsync(paymentController.createPaymentIntent));
router.post("/confirm", authenticate, catchAsync(paymentController.confirmOrder));

module.exports = router;
