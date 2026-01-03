const express = require("express");
const router = express.Router();
const Vital = require("../models/Vital");
const User = require("../models/User");
const Link = require("../models/Link");

/* ===== GET VITALS BY USER ID (FOR PATIENT) ===== */
router.get("/:userId", async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`✅ Found ${vitals.length} vitals for user ${req.params.userId}`);
    
    const formatted = vitals.map(v => ({
      VitalID: v._id.toString(),
      UserID: v.userId,
      HeartRate: v.heartRate,
      BloodPressureSys: v.bloodPressureSys,
      BloodPressureDia: v.bloodPressureDia,
      OxygenSaturation: v.oxygenSaturation,
      Notes: v.notes,
      DoctorReaction: v.doctorReaction,
      RecordedDate: v.recordedDate,
      RecordedTime: v.recordedTime
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching vitals:", err);
    res.status(500).json({ error: "Failed to fetch vitals" });
  }
});

/* ===== GET VITALS BY PATIENT REFERENCE (FOR DOCTOR) ===== */
router.get("/by-ref/:ref", async (req, res) => {
  try {
    console.log(`🔍 Looking for patient with ref: ${req.params.ref}`);

    const patient = await User.findOne({ 
      reference: req.params.ref,
      role: "patient"
    });

    if (!patient) {
      console.log(`❌ Patient not found: ${req.params.ref}`);
      return res.json([]);
    }

    console.log(`✅ Found patient: ${patient.name} (ID: ${patient._id})`);

    const link = await Link.findOne({ patientRef: req.params.ref });
    if (!link) {
      console.log(`⚠️ Patient not linked`);
      return res.json([]);
    }

    console.log(`✅ Patient linked to doctor: ${link.doctorRef}`);

    const vitals = await Vital.find({ userId: patient._id.toString() })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`✅ Returning ${vitals.length} vitals`);

    const formatted = vitals.map(v => ({
      VitalID: v._id.toString(),
      UserID: v.userId,
      HeartRate: v.heartRate,
      BloodPressureSys: v.bloodPressureSys,
      BloodPressureDia: v.bloodPressureDia,
      OxygenSaturation: v.oxygenSaturation,
      Notes: v.notes,
      DoctorReaction: v.doctorReaction,
      RecordedDate: v.recordedDate,
      RecordedTime: v.recordedTime
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching vitals by ref:", err);
    res.status(500).json({ error: "Failed to fetch vitals" });
  }
});

/* ===== ADD NEW VITAL ===== */
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received vital data:", req.body);

    const vital = new Vital({
      userId: req.body.UserID.toString(),
      heartRate: Number(req.body.HeartRate),
      bloodPressureSys: Number(req.body.BloodPressureSys),
      bloodPressureDia: Number(req.body.BloodPressureDia),
      oxygenSaturation: Number(req.body.OxygenSaturation),
      notes: req.body.Notes || "",
      doctorReaction: "",
      recordedDate: req.body.RecordedDate || new Date().toLocaleDateString(),
      recordedTime: req.body.RecordedTime || new Date().toLocaleTimeString()
    });

    await vital.save();

    console.log("✅ Vital saved:", vital._id);
    res.json({ 
      success: true,
      vital: {
        VitalID: vital._id.toString(),
        UserID: vital.userId,
        HeartRate: vital.heartRate,
        BloodPressureSys: vital.bloodPressureSys,
        BloodPressureDia: vital.bloodPressureDia,
        OxygenSaturation: vital.oxygenSaturation,
        Notes: vital.notes,
        DoctorReaction: vital.doctorReaction,
        RecordedDate: vital.recordedDate,
        RecordedTime: vital.recordedTime
      }
    });
  } catch (err) {
    console.error("❌ Error saving vital:", err);
    res.status(500).json({ error: "Failed to save vital" });
  }
});

/* ===== UPDATE DOCTOR REACTION ===== */
router.put("/reaction/:id", async (req, res) => {
  try {
    const vital = await Vital.findById(req.params.id);
    
    if (!vital) {
      return res.status(404).json({ error: "Vital not found" });
    }

    vital.doctorReaction = req.body.reaction;
    await vital.save();

    console.log("✅ Reaction updated:", vital._id, "->", req.body.reaction);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating reaction:", err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
});

/* ===== DOWNLOAD ALL VITALS ===== */
router.get("/download/all", async (req, res) => {
  try {
    const vitals = await Vital.find().sort({ createdAt: -1 });

    const headers = "VitalID,UserID,HeartRate,BloodPressureSys,BloodPressureDia,OxygenSaturation,Notes,DoctorReaction,RecordedDate,RecordedTime\n";
    const rows = vitals.map(v => 
      `${v._id},${v.userId},${v.heartRate},${v.bloodPressureSys},${v.bloodPressureDia},${v.oxygenSaturation},"${v.notes}",${v.doctorReaction},${v.recordedDate},${v.recordedTime}`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=vitals.csv");
    res.send(headers + rows);
  } catch (err) {
    console.error("❌ Error downloading vitals:", err);
    res.status(500).json({ error: "Failed to download vitals" });
  }
});

module.exports = router;