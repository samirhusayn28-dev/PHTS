const express = require("express");
const router = express.Router();
const { appendToCSV, readCSV } = require("../utils/csvHelper");

router.post("/", async (req, res) => {
  const activity = {
    ActivityID: Date.now(),
    UserID: req.body.UserID,
    ActivityType: req.body.ActivityType,
    Value: req.body.Value,
    Goal: req.body.Goal,
    RecordedDate: new Date().toISOString().split("T")[0]
  };

  await appendToCSV("activities.csv", activity);
  res.status(201).json(activity);
});

router.get("/:userId", async (req, res) => {
  const activities = await readCSV("activities.csv");
  res.json(activities.filter(a => a.UserID === req.params.userId));
});

module.exports = router;
