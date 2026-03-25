const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema({
  numbers: [Number],

  winners: {
    tier3: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        matches: Number,
      },
    ],
    tier4: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        matches: Number,
      },
    ],
    tier5: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        matches: Number,
      },
    ],
  },

  prizePool: Number,

  prizes: {
    tier3: Number,
    tier4: Number,
    tier5: Number,
  },

  jackpotCarry: {
    type: Number,
    default: 0,
  },

  drawDate: Date,

  // ✅ FIXED (IMPORTANT)
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },

  isPublished: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ VERY IMPORTANT (prevents duplicate draws)
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Draw", drawSchema);