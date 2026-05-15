const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { catchAsync } = require("../utils/AppError");
const { registerRules, loginRules, handleValidation } = require("../middleware/validate");

router.post("/register", registerRules, handleValidation, catchAsync(authController.register));
router.post("/login", loginRules, handleValidation, catchAsync(authController.login));
router.get("/me", catchAsync(authController.getMe));

module.exports = router;
