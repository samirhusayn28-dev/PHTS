const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/vitals", require("./routes/vitals"));
app.use("/api/link", require("./routes/link"));
app.use("/api/messages", require("./routes/messages"));

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
