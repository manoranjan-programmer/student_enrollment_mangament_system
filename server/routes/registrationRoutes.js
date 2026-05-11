const express = require("express");
const { registerCourse } = require("../controllers/registrationController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", verifyToken, registerCourse);

module.exports = router;
