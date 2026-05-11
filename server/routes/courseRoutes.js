const express = require("express");
const { addCourse, listCourses, getEnrolledStudents, getNextCode } = require("../controllers/courseController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", verifyToken, authorizeRoles("admin"), addCourse);
router.get("/", verifyToken, authorizeRoles("admin", "faculty", "student"), listCourses);
router.get("/next-code/:department/:semester", verifyToken, authorizeRoles("admin"), getNextCode);
router.get("/:courseId/enrolled-students", verifyToken, authorizeRoles("admin", "faculty"), getEnrolledStudents);

module.exports = router;
