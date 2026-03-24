const User = require("../models/User");

const generateNumbers = () => {
  let nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...nums];
};

exports.runDraw = async (req, res) => {
  try {
    const drawNumbers = generateNumbers();

    const users = await User.find();

    let winners = [];

    users.forEach((user) => {
      const userNumbers = user.scores.map((s) => s.value);

      const matches = userNumbers.filter((num) =>
        drawNumbers.includes(num)
      ).length;

      if (matches >= 3) {
        winners.push({
          user: user.email,
          matches,
        });
      }
    });

    res.json({
      drawNumbers,
      winners,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};