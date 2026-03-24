const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addScore, getScores } = require("../controllers/scoreController");

router.post("/add", auth, addScore);
router.get("/", auth, getScores);

module.exports = router;