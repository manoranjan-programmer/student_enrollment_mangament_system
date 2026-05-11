const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", verifyToken, authorizeRoles("admin"), facultyController.listFaculty);
router.post("/", verifyToken, authorizeRoles("admin"), facultyController.assignFaculty);
router.get("/next-code/:department", verifyToken, authorizeRoles("admin"), facultyController.getNextCode);
router.get("/:id/students", verifyToken, authorizeRoles("admin"), facultyController.getEnrolledStudents);
router.get("/search/:code", verifyToken, authorizeRoles("admin"), facultyController.searchFaculty);
router.post("/assign", verifyToken, authorizeRoles("admin"), facultyController.assignFaculty);

module.exports = router;
