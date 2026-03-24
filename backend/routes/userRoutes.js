const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { updateCharity } = require("../controllers/userController");

router.put("/charity", auth, updateCharity);

module.exports = router;