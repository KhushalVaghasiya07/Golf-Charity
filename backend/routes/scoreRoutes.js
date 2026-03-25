const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const subscription = require("../middleware/subscriptionMiddleware");

const { addScore, getScores } = require("../controllers/scoreController");

router.post("/add", auth, subscription, addScore);
router.get("/", auth, subscription, getScores);

module.exports = router;