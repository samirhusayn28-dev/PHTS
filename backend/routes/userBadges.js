const express = require("express");
const router = express.Router();
const { appendToCSV, readCSV } = require("../utils/csvHelper");

router.post("/", async (req, res) => {
  const record = {
    UserBadgeID: Date.now(),
    UserID: req.body.UserID,
    BadgeID: req.body.BadgeID,
    UnlockedDate: new Date().toISOString().split("T")[0],
    Points: req.body.Points
  };

  await appendToCSV("userBadges.csv", record);
  res.status(201).json(record);
});

router.get("/:userId", async (req, res) => {
  const data = await readCSV("userBadges.csv");
  res.json(data.filter(b => b.UserID === req.params.userId));
});

module.exports = router;
