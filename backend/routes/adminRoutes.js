const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { runDraw } = require("../controllers/drawController");
const { createDraw, publishDraw, } = require("../controllers/drawController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { getLatestDraw } = require("../controllers/drawController");
const { getAnalytics } = require("../controllers/adminController");
const { getDrawHistory } = require("../controllers/adminController");
const { getAllWinners, markAsPaid } = require("../controllers/adminController");
const {
  banUser,
  unbanUser,
  updateSubscription
} = require("../controllers/adminController");

router.put("/ban/:userId", banUser);
router.put("/unban/:userId", unbanUser);
router.put("/subscription/:userId", updateSubscription);
router.get("/analytics", getAnalytics);
router.get("/draw-history", getDrawHistory);
router.get("/winners", getAllWinners);
router.get("/latest-draw", getLatestDraw);

router.use(auth, admin);

router.put("/mark-paid/:userId/:winId", markAsPaid);

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
router.put("/verify/:userId/:winId", async (req, res) => {
  try {
    const { status } = req.body;

    const user = await require("../models/User").findById(req.params.userId);
    const win = user.winnings.id(req.params.winId);

    if (!win) {
      return res.status(404).json({ msg: "Winning not found" });
    }

    win.status = status;

    await user.save();

    res.json({ msg: "Status updated", win });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/draw", createDraw);
router.put("/draw/:id/publish", publishDraw);

module.exports = router;