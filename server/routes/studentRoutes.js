const express = require("express");
const { addStudent, listStudents, getNextRoll } = require("../controllers/studentController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", verifyToken, authorizeRoles("admin"), addStudent);
router.get("/", verifyToken, authorizeRoles("admin", "faculty"), listStudents);
router.get("/next-roll/:department/:year", verifyToken, authorizeRoles("admin"), getNextRoll);

module.exports = router;
