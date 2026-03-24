const User = require("../models/User");

exports.updateCharity = async (req, res) => {
  try {
    const { charity } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user,
      { charity },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};