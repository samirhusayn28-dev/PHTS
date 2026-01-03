const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  heartRate: { type: Number, required: true },
  bloodPressureSys: { type: Number, required: true },
  bloodPressureDia: { type: Number, required: true },
  oxygenSaturation: { type: Number, required: true },
  notes: { type: String, default: "" },
  doctorReaction: { type: String, default: "" },
  recordedDate: { type: String, required: true },
  recordedTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vital", vitalSchema);