const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", verifyToken, authorizeRoles("student", "admin"), getRecommendations);

module.exports = router;
