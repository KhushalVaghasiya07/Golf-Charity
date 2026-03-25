const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { updateCharity } = require("../controllers/userController");
const { getPublishedDraw } = require("../controllers/drawController");
const { getNextDraw } = require("../controllers/drawController");



router.get("/next-draw", getNextDraw);
router.get("/draw", getPublishedDraw);
router.put("/charity", auth, updateCharity);
router.get("/profile", auth, async (req, res) => {
  const user = await require("../models/User").findById(req.user).select("-password");
  res.json(user);
});
router.put("/activate-subscription", auth, async (req, res) => {
  const user = await require("../models/User").findById(req.user);

  user.subscriptionStatus = "active";
  user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await user.save();

  res.json({ msg: "Subscription activated", user });
});

router.put("/upload-proof/:id", auth, async (req, res) => {
  const { proof } = req.body;

  const user = await require("../models/User").findById(req.user);

  const winning = user.winnings.id(req.params.id);

  if (!winning) return res.status(404).json({ msg: "Not found" });

  winning.proof = proof;
  winning.status = "pending";

  await user.save();

  res.json({ msg: "Proof uploaded" });
});


router.put("/upload-proof/:winId", auth, async (req, res) => {
  try {
    const { proof } = req.body;

    const user = await require("../models/User").findById(req.user);

    const winning = user.winnings.id(req.params.winId);

    if (!winning) {
      return res.status(404).json({ msg: "Winning not found" });
    }

    winning.proof = proof;
    winning.status = "pending";

    await user.save();

    res.json({ msg: "Proof uploaded", winning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;