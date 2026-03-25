const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  value: {
    type: Number,
    min: 1,
    max: 45,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isSubscribed: { type: Boolean, default: true },
  scores: [scoreSchema],
  charity: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  winnings: [
    {
      drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw" },
      tier: String,
      amount: Number,
      proof: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "paid"],
        default: "pending",
      },
    },
  ],

  subscriptionStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  subscriptionEndDate: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);