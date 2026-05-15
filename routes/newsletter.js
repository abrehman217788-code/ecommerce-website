const express = require("express");
const router = express.Router();

const subscribers = [];

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (subscribers.find((s) => s.email === email)) {
      return res.status(409).json({ error: "Already subscribed" });
    }
    subscribers.push({ email, subscribedAt: new Date() });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

module.exports = router;
