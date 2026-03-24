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
});

module.exports = mongoose.model("User", userSchema);