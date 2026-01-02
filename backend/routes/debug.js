const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Debug endpoint to check all data
router.get("/check/:patientRef", (req, res) => {
  try {
    const usersFile = path.join(__dirname, "../data/users.csv");
    const vitalsFile = path.join(__dirname, "../data/vitals.csv");
    const linkFile = path.join(__dirname, "../data/DoctorPatientMapping.csv");

    // Read all files
    const users = fs.readFileSync(usersFile, "utf8");
    const vitals = fs.readFileSync(vitalsFile, "utf8");
    const links = fs.readFileSync(linkFile, "utf8");

    const patientRef = req.params.patientRef;

    // Parse users
    const userLines = users.trim().split("\n").slice(1);
    const patient = userLines
      .map(l => {
        const [id, name, email, password, role, reference] = l.split(",");
        return { id, name, email, role, reference };
      })
      .find(u => u.reference === patientRef && u.role === "patient");

    // Parse vitals
    const vitalLines = vitals.trim().split("\n");
    const vitalHeaders = vitalLines[0].split(",");
    const patientVitals = vitalLines.slice(1)
      .map(l => {
        const parts = l.split(",");
        return {
          VitalID: parts[0],
          UserID: parts[1],
          HeartRate: parts[2],
          matches: patient ? parts[1] === patient.id : false
        };
      })
      .filter(v => patient && v.UserID === patient.id);

    // Parse links
    const linkLines = links.trim().split("\n").slice(1);
    const patientLink = linkLines
      .map(l => {
        const [DoctorRef, PatientRef] = l.split(",");
        return { DoctorRef, PatientRef };
      })
      .find(l => l.PatientRef === patientRef);

    res.json({
      patientRef,
      patient: patient || "NOT FOUND",
      link: patientLink || "NOT LINKED",
      vitalsFound: patientVitals.length,
      vitalsDetails: patientVitals,
      allVitalsCount: vitalLines.length - 1,
      diagnosis: !patient 
        ? "❌ Patient not found in users.csv" 
        : !patientLink 
        ? "⚠️ Patient not linked to any doctor" 
        : patientVitals.length === 0 
        ? "⚠️ Patient has no vitals recorded" 
        : "✅ Everything looks good!"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;