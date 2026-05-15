const express = require("express");
const router = express.Router();
const passwordResetController = require("../controllers/passwordResetController");
const { catchAsync } = require("../utils/AppError");
const { forgotPasswordRules, resetPasswordRules, handleValidation } = require("../middleware/validate");

router.post("/forgot", forgotPasswordRules, handleValidation, catchAsync(passwordResetController.forgot));
router.post("/reset", resetPasswordRules, handleValidation, catchAsync(passwordResetController.reset));

module.exports = router;
