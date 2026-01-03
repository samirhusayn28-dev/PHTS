const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  doctorRef: { type: String, required: true },
  patientRef: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Link", linkSchema);