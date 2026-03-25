const User = require("../models/User");

exports.addScore = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({
        msg: "Score must be between 1 and 45",
      });
    }

    const user = await User.findById(req.user);

    // add newest first
    user.scores.unshift({ value });

    // keep only last 5
    if (user.scores.length > 5) {
      user.scores = user.scores.slice(0, 5);
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