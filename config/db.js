const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/velora";

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((m) => {
      console.log("Connected to MongoDB");
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB, MONGO_URI };
