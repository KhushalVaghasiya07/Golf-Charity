const User = require("../models/User");

module.exports = async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access only" });
  }

  next();
};