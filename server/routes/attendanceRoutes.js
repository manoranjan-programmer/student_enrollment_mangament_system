const express = require("express");
const { markAttendance, getAttendanceRoster } = require("../controllers/attendanceController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", verifyToken, authorizeRoles("faculty", "admin"), getAttendanceRoster);
router.post("/", verifyToken, authorizeRoles("faculty", "admin"), markAttendance);

module.exports = router;
