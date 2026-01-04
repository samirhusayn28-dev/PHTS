const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

/* ===== GET ALL MESSAGES FOR A USER ===== */
router.get("/:ref", async (req, res) => {
  try {
    const userRef = req.params.ref;
    
    console.log("📬 Fetching messages for:", userRef);
    
    const messages = await Message.find({
      $or: [
        { from: userRef },
        { to: userRef }
      ]
    }).sort({ createdAt: 1 });

    console.log(`✅ Found ${messages.length} messages for ${userRef}`);
    console.log("Messages:", messages);
    
    const formatted = messages.map(m => ({
      id: m._id.toString(),
      from: m.from,
      to: m.to,
      text: m.text,
      date: m.date,
      time: m.time
    }));

    console.log("📤 Sending formatted messages:", formatted);
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* ===== SEND A NEW MESSAGE ===== */
router.post("/", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    
    console.log("📥 Received message request:", { from, to, text });
    
    if (!from || !to || !text) {
      console.log("⚠️ Missing fields");
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const now = new Date();
    
    const message = new Message({
      from,
      to,
      text,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    });

    await message.save();
    
    console.log("✅ Message saved:", message);
    res.json({ 
      success: true,
      message: {
        id: message._id.toString(),
        from: message.from,
        to: message.to,
        text: message.text,
        date: message.date,
        time: message.time
      }
    });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;