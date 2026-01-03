const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Generate reference
const genRef = (role) =>
  (role === "doctor" ? "DOC-" : "PAT-") +
  Math.floor(1000 + Math.random() * 9000);

/* ===== SIGNUP ===== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Email validation
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ error: "Only @gmail.com emails are allowed" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate unique reference
    let reference;
    let isUnique = false;
    while (!isUnique) {
      reference = genRef(role);
      const existing = await User.findOne({ reference });
      if (!existing) isUnique = true;
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      reference
    });

    await user.save();

    console.log("✅ User created:", user.email);
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      reference: user.reference
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ===== LOGIN ===== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ User logged in:", user.email);
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      reference: user.reference
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===== GOOGLE SIGN-IN ===== */
router.post("/google-signin", async (req, res) => {
  try {
    const { email, name, role } = req.body;

    // Email validation
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ error: "Only @gmail.com emails are allowed" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update role if different
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
      
      console.log("✅ Google user logged in:", user.email);
      return res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        reference: user.reference
      });
    }

    // Create new user
    let reference;
    let isUnique = false;
    while (!isUnique) {
      reference = genRef(role);
      const existing = await User.findOne({ reference });
      if (!existing) isUnique = true;
    }

    user = new User({
      name,
      email,
      password: "GOOGLE_AUTH",
      role,
      reference
    });

    await user.save();

    console.log("✅ Google user created:", user.email);
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      reference: user.reference
    });
  } catch (err) {
    console.error("❌ Google signin error:", err);
    res.status(500).json({ error: "Google signin failed" });
  }
});

module.exports = router;