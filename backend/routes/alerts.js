const express = require("express");
const router = express.Router();
const { appendToCSV, readCSV } = require("../utils/csvHelper");

router.post("/", async (req, res) => {
  const alert = {
    AlertID: Date.now(),
    UserID: req.body.UserID,
    VitalID: req.body.VitalID,
    AlertType: req.body.AlertType,
    Threshold: req.body.Threshold,
    ActualValue: req.body.ActualValue,
    Severity: req.body.Severity,
    AlertDate: new Date().toISOString().split("T")[0],
    AlertTime: new Date().toLocaleTimeString(),
    Acknowledged: "No"
  };

  await appendToCSV("alerts.csv", alert);
  res.status(201).json(alert);
});

router.get("/:userId", async (req, res) => {
  const alerts = await readCSV("alerts.csv");
  res.json(alerts.filter(a => a.UserID === req.params.userId));
});

module.exports = router;
