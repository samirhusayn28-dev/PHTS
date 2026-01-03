require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://phts-samirhusayn28-devs-projects.vercel.app"  // ⚠️ Apna actual Vercel URL dalo
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/vitals", require("./routes/vitals"));
app.use("/api/link", require("./routes/link"));
app.use("/api/messages", require("./routes/messages"));

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "✅ PHTS Backend running with MongoDB!",
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});