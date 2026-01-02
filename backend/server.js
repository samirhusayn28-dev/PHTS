const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS Configuration (pehle karo, routes se pehle)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://phts-samirhusayn28-devs-projects.vercel.app/"  // ⚠️ Apna actual Vercel URL yahan dalo
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/vitals", require("./routes/vitals"));
app.use("/api/link", require("./routes/link"));
app.use("/api/messages", require("./routes/messages"));

// Health check endpoint (deployment testing ke liye)
app.get("/", (req, res) => {
  res.json({ 
    status: "✅ PHTS Backend is running!",
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Port Configuration (Railway/Render automatically provide PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});