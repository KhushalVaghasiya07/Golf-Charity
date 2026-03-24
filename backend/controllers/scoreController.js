const User = require("../models/User");

exports.addScore = async (req, res) => {
  try {
    const { value } = req.body;

    const user = await User.findById(req.user);

    user.scores.unshift({ value });

    if (user.scores.length > 5) {
      user.scores.pop();
    }

    await user.save();

    res.json(user.scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScores = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json(user.scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};