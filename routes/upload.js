const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadController = require("../controllers/uploadController");
const { authenticate, adminOnly } = require("../middleware/auth");
const { catchAsync } = require("../utils/AppError");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif|webp|svg/;
    const valid = types.test(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error("Only image files allowed"), valid);
  },
});

router.post("/", authenticate, adminOnly, upload.single("image"), catchAsync(uploadController.uploadSingle));
router.post("/multiple", authenticate, adminOnly, upload.array("images", 5), catchAsync(uploadController.uploadMultiple));

module.exports = router;
