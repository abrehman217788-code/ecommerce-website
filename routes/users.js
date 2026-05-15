const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, adminOnly } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");

router.get("/", authenticate, adminOnly, catchAsync(userController.list));
router.get("/me", authenticate, catchAsync(userController.getProfile));
router.put("/me", authenticate, catchAsync(userController.updateProfile));
router.post("/wishlist", authenticate, catchAsync(userController.toggleWishlist));
router.put("/:id/role", authenticate, adminOnly, catchAsync(userController.updateRole));

module.exports = router;
