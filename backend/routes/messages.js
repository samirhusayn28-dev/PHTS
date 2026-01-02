const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const FILE = path.join(__dirname, "../data/messages.csv");

// Initialize file if doesn't exist
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "id,from,to,text,date,time\n");
}

function read() {
  try {
    const content = fs.readFileSync(FILE, "utf8").trim();
    if (!content) return [];
    
    const lines = content.split("\n");
    if (lines.length < 2) return [];
    
    const messages = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 6) {
        messages.push({
          id: parts[0],
          from: parts[1],
          to: parts[2],
          text: parts.slice(3, -2).join(","), // Handle commas in text
          date: parts[parts.length - 2],
          time: parts[parts.length - 1]
        });
      }
    }
    return messages;
  } catch (err) {
    console.error("Error reading messages:", err);
    return [];
  }
}

function write(data) {
  try {
    const lines = ["id,from,to,text,date,time"];
    data.forEach(m => {
      // Escape text that contains commas
      const text = m.text.replace(/,/g, ";"); // Replace commas with semicolons
      lines.push(`${m.id},${m.from},${m.to},${text},${m.date},${m.time}`);
    });
    fs.writeFileSync(FILE, lines.join("\n"));
  } catch (err) {
    console.error("Error writing messages:", err);
  }
}

/* ===== GET ALL MESSAGES FOR A USER (PATIENT OR DOCTOR) ===== */
router.get("/:ref", (req, res) => {
  try {
    const userRef = req.params.ref;
    const allMessages = read();
    
    // Get all messages where user is sender or receiver
    const userMessages = allMessages.filter(
      m => m.from === userRef || m.to === userRef
    );
    
    console.log(`📬 Messages for ${userRef}:`, userMessages.length);
    res.json(userMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* ===== SEND A NEW MESSAGE ===== */
router.post("/", (req, res) => {
  try {
    const { from, to, text } = req.body;
    
    if (!from || !to || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const all = read();
    const now = new Date();
    
    const newMessage = {
      id: Date.now().toString(),
      from,
      to,
      text,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    };
    
    all.push(newMessage);
    write(all);
    
    console.log("✅ Message sent:", newMessage);
    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;