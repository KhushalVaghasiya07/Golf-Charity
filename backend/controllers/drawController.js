const User = require("../models/User");
const Draw = require("../models/Draw");

// 🔹 Generate 5 random numbers (1–45)
const generateNumbers = () => {
  let nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...nums];
};

exports.createDraw = async (req, res) => {
  try {
    const now = new Date();

    const month = now.getMonth();
    const year = now.getFullYear();

    // 🔒 ATOMIC CHECK (no duplicates even with multiple clicks)
    let draw = await Draw.findOne({ month, year });

    if (draw && draw.numbers && draw.numbers.length > 0) {
      return res.status(400).json({
        message: "Draw already exists for this month",
      });
    }

    // 🎯 Generate numbers
    const drawNumbers = generateNumbers();

    const users = await User.find();

    let tier3 = [];
    let tier4 = [];
    let tier5 = [];

    // 🎯 MATCH LOGIC
    users.forEach((user) => {
      const userNumbers = user.scores.map((s) => s.value);

      const matches = userNumbers.filter((num) =>
        drawNumbers.includes(num)
      ).length;

      if (matches === 3) tier3.push({ user: user._id, matches });
      if (matches === 4) tier4.push({ user: user._id, matches });
      if (matches === 5) tier5.push({ user: user._id, matches });
    });

    // 💰 PRIZE LOGIC
    const activeUsers = await User.countDocuments({
      subscriptionStatus: "active",
    });

    const entryFee = 100;
    let totalPool = activeUsers * entryFee;

    const lastDraw = await Draw.findOne().sort({ createdAt: -1 });

    let carry = 0;

    if (lastDraw && lastDraw.winners?.tier5?.length === 0) {
      carry = lastDraw.jackpotCarry || 0;
    }

    totalPool += carry;

    let tier5Prize = totalPool * 0.4;
    let tier4Prize = totalPool * 0.35;
    let tier3Prize = totalPool * 0.25;

    if (tier5.length > 0) tier5Prize /= tier5.length;
    if (tier4.length > 0) tier4Prize /= tier4.length;
    if (tier3.length > 0) tier3Prize /= tier3.length;

    let newCarry = tier5.length === 0 ? totalPool * 0.4 : 0;

    // 📅 Draw date (last day of month)
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59
    );

    // 🔥 IF DRAW EXISTS → UPDATE IT
    if (draw) {
      draw.numbers = drawNumbers;
      draw.winners = { tier3, tier4, tier5 };
      draw.prizePool = totalPool;
      draw.prizes = {
        tier3: tier3Prize,
        tier4: tier4Prize,
        tier5: tier5Prize,
      };
      draw.jackpotCarry = newCarry;
      draw.drawDate = lastDay;
      draw.isPublished = false;
    } else {
      // 🔥 CREATE NEW DRAW
      draw = new Draw({
        numbers: drawNumbers,
        winners: { tier3, tier4, tier5 },
        prizePool: totalPool,
        prizes: {
          tier3: tier3Prize,
          tier4: tier4Prize,
          tier5: tier5Prize,
        },
        jackpotCarry: newCarry,
        drawDate: lastDay,
        month,
        year,
        isPublished: false,
      });
    }

    await draw.save();

    // 🏆 STORE WINNERS IN USERS
    const updateWinners = async (winners, tier, amount) => {
      for (let w of winners) {
        await User.findByIdAndUpdate(w.user, {
          $push: {
            winnings: {
              drawId: draw._id,
              tier,
              amount,
              status: "pending",
            },
          },
        });
      }
    };

    await updateWinners(tier3, "tier3", tier3Prize);
    await updateWinners(tier4, "tier4", tier4Prize);
    await updateWinners(tier5, "tier5", tier5Prize);

    res.json(draw);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Draw already exists for this month",
      });
    }

    res.status(500).json({ error: err.message });
  }
};



// 🔥 PUBLISH DRAW
exports.publishDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const draw = await Draw.findById(id);

    if (!draw) {
      return res.status(404).json({ msg: "Draw not found" });
    }

    // 🔒 Prevent re-publish
    if (draw.isPublished) {
      return res.status(400).json({ msg: "Draw already published" });
    }

    draw.isPublished = true;
    await draw.save();

    res.json({ msg: "Draw published", draw });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 GET LATEST PUBLISHED DRAW
exports.getPublishedDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("winners.tier3.user winners.tier4.user winners.tier5.user");

    res.json(draw);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 GET NEXT DRAW DATE
exports.getNextDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne().sort({ createdAt: -1 });

    res.json({ drawDate: draw?.drawDate });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getLatestDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne().sort({ createdAt: -1 });
    res.json(draw);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};