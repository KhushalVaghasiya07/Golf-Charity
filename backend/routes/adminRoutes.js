const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { runDraw } = require("../controllers/drawController");

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/draw", runDraw);

module.exports = router;