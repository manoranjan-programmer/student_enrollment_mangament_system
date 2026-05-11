const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", verifyToken, authorizeRoles("admin", "faculty", "student"), getDashboard);

module.exports = router;
