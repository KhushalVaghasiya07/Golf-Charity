const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 10000, // ₹100 (in paisa)
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid payment" });
    }

    const user = await User.findById(req.user);
    console.log("USER FOUND:", user);

    user.subscriptionStatus = "active";
    user.subscriptionEndDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await user.save();

    res.json({ msg: "Payment verified & subscription activated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


