const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const file = path.join(__dirname, "../data/DoctorPatientMapping.csv");

function read() {
  if (!fs.existsSync(file)) return [];
  const [h, ...r] = fs.readFileSync(file, "utf8").trim().split("\n");
  const heads = h.split(",");
  return r.map(l => {
    const o = {};
    l.split(",").forEach((v, i) => (o[heads[i]] = v));
    return o;
  });
}

function write(d) {
  const h = Object.keys(d[0]).join(",");
  const r = d.map(x => Object.values(x).join(","));
  fs.writeFileSync(file, [h, ...r].join("\n"));
}

router.post("/", (req, res) => {
  const all = read();
  if (all.find(x => x.PatientRef === req.body.patientRef))
    return res.json({ error: "Already linked" });

  all.push({
    DoctorRef: req.body.doctorRef,
    PatientRef: req.body.patientRef
  });
  write(all);
  res.json({ success: true });
});

router.get("/doctor/:pref", (req, res) =>
  res.json(read().find(x => x.PatientRef === req.params.pref) || null)
);

router.delete("/unlink/:pref", (req, res) => {
  write(read().filter(x => x.PatientRef !== req.params.pref));
  res.json({ success: true });
});

module.exports = router;
