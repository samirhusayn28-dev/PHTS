const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const file = path.join(__dirname, "../data/vitals.csv");
const usersFile = path.join(__dirname, "../data/users.csv");
const linkFile = path.join(__dirname, "../data/DoctorPatientMapping.csv");

// Initialize file with CORRECT headers including UserID
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, "VitalID,UserID,HeartRate,BloodPressureSys,BloodPressureDia,OxygenSaturation,Notes,DoctorReaction,RecordedDate,RecordedTime\n");
}

function readCSV(fp) {
  if (!fs.existsSync(fp)) return [];
  const content = fs.readFileSync(fp, "utf8").trim();
  if (!content) return [];
  
  const lines = content.split("\n");
  if (lines.length < 1) return [];
  
  const headers = lines[0].split(",");
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(",");
    const obj = {};
    headers.forEach((key, idx) => {
      obj[key] = values[idx] || "";
    });
    rows.push(obj);
  }
  
  console.log(`📊 Read ${rows.length} rows from ${path.basename(fp)}`);
  return rows;
}

function writeCSV(fp, data) {
  if (!data.length) {
    fs.writeFileSync(fp, "VitalID,UserID,HeartRate,BloodPressureSys,BloodPressureDia,OxygenSaturation,Notes,DoctorReaction,RecordedDate,RecordedTime\n");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const headerLine = headers.join(",");
  const dataLines = data.map(row => 
    headers.map(h => row[h] || "").join(",")
  );
  
  fs.writeFileSync(fp, headerLine + "\n" + dataLines.join("\n"));
  console.log(`💾 Wrote ${data.length} rows to ${path.basename(fp)}`);
}

/* ===== DOWNLOAD ALL VITALS ===== */
router.get("/download/all", (req, res) => {
  if (!fs.existsSync(file)) {
    return res.status(404).send("No data available");
  }
  res.download(file, "vitals.csv");
});

/* ===== GET VITALS BY PATIENT REFERENCE (FOR DOCTOR) ===== */
router.get("/by-ref/:ref", (req, res) => {
  try {
    const users = readCSV(usersFile);
    const links = readCSV(linkFile);

    console.log(`🔍 Looking for patient with ref: ${req.params.ref}`);

    // Find patient by reference
    const patient = users.find(
      u => u.reference === req.params.ref && u.role === "patient"
    );
    
    if (!patient) {
      console.log(`❌ Patient not found: ${req.params.ref}`);
      console.log(`Available patients:`, users.filter(u => u.role === "patient").map(u => u.reference));
      return res.json([]);
    }

    console.log(`✅ Found patient: ${patient.name} (ID: ${patient.id})`);

    // Check if this patient is linked to any doctor
    const link = links.find(l => l.PatientRef === req.params.ref);
    
    if (!link) {
      console.log(`⚠️ Patient ${req.params.ref} not linked to any doctor`);
      return res.json([]);
    }

    console.log(`✅ Patient is linked to doctor: ${link.DoctorRef}`);

    // Get vitals for this patient (last 10)
    const allVitals = readCSV(file);
    console.log(`📋 Total vitals in file: ${allVitals.length}`);
    
    // Log first few vitals to debug
    if (allVitals.length > 0) {
      console.log(`Sample vitals UserIDs:`, allVitals.slice(0, 3).map(v => v.UserID));
      console.log(`Looking for UserID: "${patient.id}"`);
    }
    
    const vitals = allVitals
      .filter(v => {
        const match = v.UserID.toString().trim() === patient.id.toString().trim();
        if (!match && allVitals.indexOf(v) < 3) {
          console.log(`Comparing: "${v.UserID}" vs "${patient.id}" = ${match}`);
        }
        return match;
      })
      .slice(-10);

    console.log(`✅ Returning ${vitals.length} vitals for patient ${patient.id}`);
    res.json(vitals);
  } catch (err) {
    console.error("❌ Error fetching vitals by ref:", err);
    res.status(500).json({ error: "Failed to fetch vitals" });
  }
});

/* ===== GET VITALS BY USER ID (FOR PATIENT) ===== */
router.get("/:userId", (req, res) => {
  try {
    console.log(`🔍 Fetching vitals for UserID: ${req.params.userId}`);
    
    const allVitals = readCSV(file);
    console.log(`📋 Total vitals in CSV: ${allVitals.length}`);
    
    if (allVitals.length > 0) {
      console.log("📌 Sample vital:", allVitals[0]);
    }
    
    const vitals = allVitals
      .filter(v => {
        console.log(`Comparing: v.UserID="${v.UserID}" === req.params.userId="${req.params.userId}"`);
        return v.UserID === req.params.userId;
      })
      .slice(-5);
    
    console.log(`✅ Found ${vitals.length} vitals for user ${req.params.userId}`);
    res.json(vitals);
  } catch (err) {
    console.error("❌ Error fetching vitals:", err);
    res.status(500).json({ error: "Failed to fetch vitals" });
  }
});

/* ===== ADD NEW VITAL ===== */
router.post("/", (req, res) => {
  try {
    console.log("📥 Received vital data:", req.body);
    
    const all = readCSV(file);
    
    const newVital = {
      VitalID: Date.now().toString(),
      UserID: req.body.UserID.toString(),
      HeartRate: req.body.HeartRate.toString(),
      BloodPressureSys: req.body.BloodPressureSys.toString(),
      BloodPressureDia: req.body.BloodPressureDia.toString(),
      OxygenSaturation: req.body.OxygenSaturation.toString(),
      Notes: req.body.Notes || "",
      DoctorReaction: "",
      RecordedDate: req.body.RecordedDate || new Date().toLocaleDateString(),
      RecordedTime: req.body.RecordedTime || new Date().toLocaleTimeString()
    };
    
    all.push(newVital);
    writeCSV(file, all);
    
    console.log("✅ Vital saved successfully:", newVital);
    res.json({ success: true, vital: newVital });
  } catch (err) {
    console.error("❌ Error saving vital:", err);
    res.status(500).json({ error: "Failed to save vital", details: err.message });
  }
});

/* ===== UPDATE DOCTOR REACTION ===== */
router.put("/reaction/:id", (req, res) => {
  try {
    const all = readCSV(file);
    const vital = all.find(v => v.VitalID === req.params.id);
    
    if (vital) {
      vital.DoctorReaction = req.body.reaction;
      writeCSV(file, all);
      console.log("✅ Reaction updated:", vital.VitalID, "->", req.body.reaction);
      res.json({ success: true });
    } else {
      console.log("❌ Vital not found:", req.params.id);
      res.status(404).json({ error: "Vital not found" });
    }
  } catch (err) {
    console.error("❌ Error updating reaction:", err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
});

module.exports = router;