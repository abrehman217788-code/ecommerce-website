require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

const products = [
  { name: "SonicBuds Pro", description: "Premium wireless earbuds with active noise cancellation, 30h battery life, and crystal-clear call quality.", price: 149, originalPrice: 199, category: "electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f75?w=400&q=80&auto=format&fit=crop", rating: 4.8, reviewCount: 2456, stock: 150, badge: "bestseller", colors: [{ name: "Midnight Black", hex: "#1a1a2e" }, { name: "Pearl White", hex: "#f5f0e8" }] },
  { name: "Luminova Watch", description: "Minimalist smartwatch with health tracking, GPS, and 14-day battery.", price: 299, originalPrice: 399, category: "electronics", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80&auto=format&fit=crop", rating: 4.7, reviewCount: 1832, stock: 80, badge: "sale", colors: [{ name: "Rose Gold", hex: "#b76e79" }, { name: "Space Gray", hex: "#717378" }] },
  { name: "NovaPhone 15 Pro", description: "Flagship smartphone with pro-grade camera system and A17 chip.", price: 1199, category: "electronics", image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80&auto=format&fit=crop", rating: 4.9, reviewCount: 5678, stock: 45, badge: "new" },
  { name: "Quantum Mouse", description: "Ultra-light gaming mouse with 26K DPI sensor, RGB lighting.", price: 79, originalPrice: 99, category: "electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80&auto=format&fit=crop", rating: 4.5, reviewCount: 892, stock: 200 },
  { name: "Urban Drift Jacket", description: "Water-resistant urban jacket with sustainable materials.", price: 189, category: "fashion", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&auto=format&fit=crop", rating: 4.6, reviewCount: 723, stock: 60, badge: "new", colors: [{ name: "Olive", hex: "#556b2f" }, { name: "Charcoal", hex: "#36454f" }], sizes: ["S", "M", "L", "XL"] },
  { name: "Aria Sneakers", description: "Lightweight knit sneakers with cloud-cushion sole.", price: 129, category: "fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format&fit=crop", rating: 4.7, reviewCount: 1567, stock: 120, badge: "bestseller", colors: [{ name: "White", hex: "#ffffff" }, { name: "Black", hex: "#000000" }], sizes: ["7", "8", "9", "10", "11"] },
  { name: "Velora Tote", description: "Handcrafted leather tote bag with gold hardware.", price: 249, category: "fashion", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80&auto=format&fit=crop", rating: 4.8, reviewCount: 432, stock: 35 },
  { name: "Purity Serum", description: "Vitamin C brightening serum with hyaluronic acid.", price: 58, category: "beauty", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80&auto=format&fit=crop", rating: 4.4, reviewCount: 2103, stock: 300, badge: "bestseller" },
  { name: "Nordic Planter Set", description: "Set of 3 ceramic planters with minimalist Nordic design.", price: 45, category: "home-garden", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80&auto=format&fit=crop", rating: 4.3, reviewCount: 567, stock: 90 },
  { name: "Pro Yoga Mat", description: "Extra-thick eco-friendly yoga mat with alignment lines.", price: 68, category: "sports", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80&auto=format&fit=crop", rating: 4.6, reviewCount: 1234, stock: 180, badge: "new" },
  { name: "SmartDesk Pro", description: "Electric standing desk with memory presets and bamboo top.", price: 599, originalPrice: 799, category: "home-garden", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bc?w=400&q=80&auto=format&fit=crop", rating: 4.7, reviewCount: 876, stock: 25, badge: "sale" },
  { name: "Wireless Charger Pad", description: "15W fast wireless charger compatible with all Qi devices.", price: 35, category: "electronics", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80&auto=format&fit=crop", rating: 4.2, reviewCount: 3456, stock: 500 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/velora");
  await Product.deleteMany({});
  await Product.insertMany(products);
  const adminExists = await User.findOne({ email: "admin@velora.com" });
  if (!adminExists) {
    await User.create({ name: "Admin", email: "admin@velora.com", password: "admin1234", role: "admin" });
  }
  const customerExists = await User.findOne({ email: "customer@velora.com" });
  if (!customerExists) {
    await User.create({ name: "Customer", email: "customer@velora.com", password: "customer1234", role: "customer" });
  }
  console.log(`Seeded ${products.length} products`);
  console.log("Admin: admin@velora.com / admin1234");
  console.log("Customer: customer@velora.com / customer1234");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
