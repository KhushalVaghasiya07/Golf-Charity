const User = require("../models/User");
const Draw = require("../models/Draw");

exports.getAnalytics = async (req, res) => {
  try {
    // 👥 Total users
    const totalUsers = await User.countDocuments();

    // ✅ Active users
    const activeUsers = await User.countDocuments({
      subscriptionStatus: "active",
    });

    // 💰 Revenue (₹100 per active user per month)
    const entryFee = 100;
    const totalRevenue = activeUsers * entryFee;

    // 🏆 Total payout
    const draws = await Draw.find();

    let totalPayout = 0;

    draws.forEach((draw) => {
      totalPayout +=
        (draw.prizes?.tier3 || 0) *
        (draw.winners?.tier3?.length || 0) +
        (draw.prizes?.tier4 || 0) *
        (draw.winners?.tier4?.length || 0) +
        (draw.prizes?.tier5 || 0) *
        (draw.winners?.tier5?.length || 0);
    });

    // ❤️ Charity (example: 10%)
    const charityPercent = 0.1;
    const charityTotal = totalRevenue * charityPercent;

    // 🧾 Admin profit
    const adminProfit = totalRevenue - totalPayout - charityTotal;

    res.json({
      totalUsers,
      activeUsers,
      totalRevenue,
      totalPayout,
      charityTotal,
      adminProfit,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getDrawHistory = async (req, res) => {
  try {
    const draws = await Draw.find()
      .sort({ createdAt: -1 })
      .select("month year numbers winners prizePool isPublished createdAt");

    res.json(draws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllWinners = async (req, res) => {
  try {
    const users = await User.find().select("email winnings");

    let winners = [];

    users.forEach((user) => {
      (user.winnings || []).forEach((win) => {
        winners.push({
          userId: user._id,
          email: user.email,
          winId: win._id,
          tier: win.tier,
          amount: win.amount,
          status: win.status,
          proof: win.proof,
        });
      });
    });

    res.json(winners);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markAsPaid = async (req, res) => {
  try {
    const { userId, winId } = req.params;

    const user = await User.findById(userId);

    const win = user.winnings.id(winId);

    if (!win) {
      return res.status(404).json({ msg: "Winning not found" });
    }

    win.status = "paid";

    await user.save();

    res.json({ msg: "Marked as paid", win });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isBanned = true;

    await user.save();

    res.json({ msg: "User banned successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isBanned = false;

    await user.save();

    res.json({ msg: "User unbanned successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.subscriptionStatus = status;

    if (status === "active") {
      user.subscriptionEndDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
    }

    await user.save();

    res.json({ msg: "Subscription updated", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};