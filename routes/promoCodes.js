const express = require("express");
const router = express.Router();
const promoCodeController = require("../controllers/promoCodeController");
const { authenticate, adminOnly } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");
const { promoCodeRules, handleValidation } = require("../middleware/validate");

router.get("/", authenticate, adminOnly, catchAsync(promoCodeController.list));
router.post("/", authenticate, adminOnly, promoCodeRules, handleValidation, catchAsync(promoCodeController.create));
router.post("/validate", catchAsync(promoCodeController.validate));
router.put("/:id", authenticate, adminOnly, catchAsync(promoCodeController.update));
router.delete("/:id", authenticate, adminOnly, catchAsync(promoCodeController.remove));

module.exports = router;
