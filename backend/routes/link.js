const express = require("express");
const router = express.Router();
const Link = require("../models/Link");

/* ===== LINK DOCTOR-PATIENT ===== */
router.post("/", async (req, res) => {
  try {
    console.log("🔗 Link request:", req.body);
    
    const { DoctorRef, PatientRef } = req.body;
    
    if (!DoctorRef || !PatientRef) {
      return res.status(400).json({ error: "Missing DoctorRef or PatientRef" });
    }

    const existing = await Link.findOne({ patientRef: PatientRef });
    if (existing) {
      console.log("⚠️ Patient already linked to:", existing.doctorRef);
      return res.json({ 
        error: `Patient already linked to ${existing.doctorRef}`,
        success: false 
      });
    }

    const link = new Link({
      doctorRef: DoctorRef,
      patientRef: PatientRef
    });

    await link.save();
    
    console.log("✅ Linked successfully:", DoctorRef, "<->", PatientRef);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error linking:", err);
    res.status(500).json({ error: "Failed to link" });
  }
});

/* ===== GET LINKED DOCTOR FOR PATIENT ===== */
router.get("/doctor/:pref", async (req, res) => {
  try {
    const link = await Link.findOne({ patientRef: req.params.pref });
    console.log(`🔍 Finding doctor for ${req.params.pref}:`, link || "Not found");
    
    if (!link) {
      return res.json(null);
    }

    res.json({
      DoctorRef: link.doctorRef,
      PatientRef: link.patientRef
    });
  } catch (err) {
    console.error("Error finding doctor:", err);
    res.json(null);
  }
});

/* ===== GET ALL PATIENTS FOR DOCTOR ===== */
router.get("/patients/:dref", async (req, res) => {
  try {
    const links = await Link.find({ doctorRef: req.params.dref });
    console.log(`🔍 Patients for ${req.params.dref}:`, links.length);
    
    const formatted = links.map(l => ({
      DoctorRef: l.doctorRef,
      PatientRef: l.patientRef
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error finding patients:", err);
    res.json([]);
  }
});

/* ===== UNLINK PATIENT FROM DOCTOR ===== */
router.delete("/:pref", async (req, res) => {
  try {
    await Link.deleteOne({ patientRef: req.params.pref });
    console.log("🔓 Unlinked patient:", req.params.pref);
    res.json({ success: true });
  } catch (err) {
    console.error("Error unlinking:", err);
    res.status(500).json({ error: "Failed to unlink" });
  }
});

module.exports = router;