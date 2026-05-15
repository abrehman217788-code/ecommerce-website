const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, adminOnly } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");
const { orderRules, shippingRules, handleValidation } = require("../middleware/validate");

router.get("/", authenticate, catchAsync(orderController.list));
router.get("/:id", authenticate, catchAsync(orderController.getById));
router.post("/", authenticate, orderRules, handleValidation, catchAsync(orderController.create));
router.put("/:id/status", authenticate, adminOnly, catchAsync(orderController.updateStatus));
router.post("/:id/cancel", authenticate, catchAsync(orderController.cancel));

module.exports = router;
