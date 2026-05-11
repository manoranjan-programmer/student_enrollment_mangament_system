const db = require("../db");

const registerCourse = async (req, res, next) => {
  try {
    const { student_id, course_id } = req.body;
    const parsedCourseId = Number(course_id);
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";

    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      return res.status(400).json({ message: "Valid course_id is required" });
    }

    let resolvedStudentId;
    if (isAdmin) {
      const parsedStudentId = Number(student_id);
      if (!Number.isInteger(parsedStudentId) || parsedStudentId <= 0) {
        return res.status(400).json({ message: "Valid student_id is required for admin registration" });
      }
      resolvedStudentId = parsedStudentId;
    } else {
      const studentResult = await db.query(
        "SELECT id FROM students WHERE user_id = $1",
        [req.user.id]
      );

      if (studentResult.rowCount === 0) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      resolvedStudentId = studentResult.rows[0].id;
    }

    const courseExists = await db.query("SELECT 1 FROM courses WHERE id = $1", [parsedCourseId]);
    if (courseExists.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const preReqCheck = await db.query(
      `SELECT c.prerequisite_course_id
       FROM courses c
       WHERE c.id = $1`,
      [parsedCourseId]
    );

    const prerequisiteId = preReqCheck.rows[0]?.prerequisite_course_id;
    if (prerequisiteId) {
      const passed = await db.query(
        `SELECT 1
         FROM results
         WHERE student_id = $1 AND course_id = $2 AND result_status = 'Pass'`,
        [resolvedStudentId, prerequisiteId]
      );
      if (passed.rowCount === 0) {
        return res.status(400).json({
          message: "Prerequisite not completed. Registration denied."
        });
      }
    }

    const { rows } = await db.query(
      `INSERT INTO registrations (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [resolvedStudentId, parsedCourseId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Student is already registered for this course" });
    }
    return next(error);
  }
};

module.exports = { registerCourse };
