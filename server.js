require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoose = require("mongoose");

const { connectDB } = require("./config/db");
const env = require("./config/env");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/upload");
const newsletterRoutes = require("./routes/newsletter");
const paymentRoutes = require("./routes/payment");
const reviewRoutes = require("./routes/reviews");
const passwordResetRoutes = require("./routes/passwordReset");
const promoCodesRoutes = require("./routes/promoCodes");

const app = express();

// Security & logging middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promo-codes", promoCodesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SPA catch-all — serve index.html for non-API GET routes
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }
  if (err.message === "Only image files allowed") {
    return res.status(400).json({ error: err.message });
  }
  console.error("Unhandled error:", err.stack || err.message);
  res.status(err.statusCode || 500).json({
    error: err.isOperational ? err.message : "Internal server error",
  });
});

// Auto-start when running standalone; export app when required as sub-app
if (require.main === module) {
  connectDB().then(() => {
    const server = app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => console.log("HTTP server closed"));
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  });
} else {
  module.exports = app;
}
