const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user)
      return res.status(404).json({ msg: "User not found" });

    // check status
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        msg: "Subscription required",
      });
    }

    // check expiry
    if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
      user.subscriptionStatus = "inactive";
      await user.save();

      return res.status(403).json({
        msg: "Subscription expired",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};