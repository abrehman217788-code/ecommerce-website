const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const { catchAsync } = require("../utils/AppError");

router.post("/", catchAsync(newsletterController.subscribe));

module.exports = router;
