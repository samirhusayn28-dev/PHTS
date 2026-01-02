const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const file = path.join(__dirname, "../data/DoctorPatientMapping.csv");

// Initialize file if doesn't exist
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, "DoctorRef,PatientRef\n");
}

function read() {
  try {
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, "utf8").trim();
    if (!content) return [];
    
    const lines = content.split("\n");
    if (lines.length < 2) return [];
    
    const [h, ...r] = lines;
    const heads = h.split(",");
    
    return r.map(l => {
      const o = {};
      l.split(",").forEach((v, i) => (o[heads[i]] = v));
      return o;
    });
  } catch (err) {
    console.error("Error reading links:", err);
    return [];
  }
}

function write(d) {
  try {
    if (!d.length) {
      fs.writeFileSync(file, "DoctorRef,PatientRef\n");
      return;
    }
    const h = Object.keys(d[0]).join(",");
    const r = d.map(x => Object.values(x).join(","));
    fs.writeFileSync(file, [h, ...r].join("\n"));
    console.log("💾 Links saved:", d.length);
  } catch (err) {
    console.error("Error writing links:", err);
  }
}

/* LINK DOCTOR-PATIENT */
router.post("/", (req, res) => {
  try {
    console.log("🔗 Link request:", req.body);
    
    const { DoctorRef, PatientRef } = req.body;
    
    if (!DoctorRef || !PatientRef) {
      return res.status(400).json({ error: "Missing DoctorRef or PatientRef" });
    }
    
    const all = read();
    
    // Check if already linked
    const existing = all.find(x => x.PatientRef === PatientRef);
    if (existing) {
      console.log("⚠️ Patient already linked to:", existing.DoctorRef);
      return res.json({ 
        error: `Patient already linked to ${existing.DoctorRef}`,
        success: false 
      });
    }

    all.push({ DoctorRef, PatientRef });
    write(all);
    
    console.log("✅ Linked successfully:", DoctorRef, "<->", PatientRef);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error linking:", err);
    res.status(500).json({ error: "Failed to link" });
  }
});

/* GET LINKED DOCTOR FOR PATIENT */
router.get("/doctor/:pref", (req, res) => {
  try {
    const all = read();
    const link = all.find(x => x.PatientRef === req.params.pref);
    console.log(`🔍 Finding doctor for ${req.params.pref}:`, link || "Not found");
    res.json(link || null);
  } catch (err) {
    console.error("Error finding doctor:", err);
    res.json(null);
  }
});

/* GET ALL PATIENTS FOR DOCTOR */
router.get("/patients/:dref", (req, res) => {
  try {
    const all = read();
    const patients = all.filter(x => x.DoctorRef === req.params.dref);
    console.log(`🔍 Patients for ${req.params.dref}:`, patients.length);
    res.json(patients);
  } catch (err) {
    console.error("Error finding patients:", err);
    res.json([]);
  }
});

/* UNLINK PATIENT FROM DOCTOR */
router.delete("/:pref", (req, res) => {
  try {
    const all = read();
    const filtered = all.filter(x => x.PatientRef !== req.params.pref);
    write(filtered);
    console.log("🔓 Unlinked patient:", req.params.pref);
    res.json({ success: true });
  } catch (err) {
    console.error("Error unlinking:", err);
    res.status(500).json({ error: "Failed to unlink" });
  }
});

module.exports = router;