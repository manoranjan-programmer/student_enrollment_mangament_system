const express = require("express");
const {
  uploadMarks,
  publishResults,
  getResults
} = require("../controllers/resultController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/marks", verifyToken, authorizeRoles("faculty", "admin"), uploadMarks);
router.post("/publish-results", verifyToken, authorizeRoles("faculty", "admin"), publishResults);
router.get("/results", verifyToken, authorizeRoles("admin", "faculty", "student"), getResults);

module.exports = router;
