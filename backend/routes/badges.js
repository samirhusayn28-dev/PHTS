const express = require("express");
const router = express.Router();
const { readCSV } = require("../utils/csvHelper");

router.get("/", async (req, res) => {
  const badges = await readCSV("badges.csv");
  res.json(badges);
});

module.exports = router;
