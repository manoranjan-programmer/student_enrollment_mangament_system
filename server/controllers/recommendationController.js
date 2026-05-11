const db = require("../db");

const getRecommendations = async (req, res, next) => {
  try {
    const studentId = req.query.studentId;
    if (!studentId) {
      return res.status(400).json({ message: "studentId query param is required" });
    }

    const strongCourses = await db.query(
      `SELECT course_id
       FROM results
       WHERE student_id = $1 AND marks > 80`,
      [studentId]
    );

    const recs = await db.query(
      `SELECT c.*
       FROM courses c
       WHERE c.is_advanced = TRUE
       AND c.prerequisite_course_id = ANY($1::int[])
       AND c.id NOT IN (
         SELECT course_id FROM registrations WHERE student_id = $2
       )`,
      [strongCourses.rows.map((r) => r.course_id), studentId]
    );

    return res.json(recs.rows);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getRecommendations };
