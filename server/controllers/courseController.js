const { createCourse, getCourses, getNextCourseCode } = require("../models/courseModel");
const db = require("../db");

const addCourse = async (req, res, next) => {
  try {
    const course = await createCourse(req.body);
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
};

const listCourses = async (req, res, next) => {
  try {
    const courses = await getCourses();
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
};

const getNextCode = async (req, res, next) => {
  try {
    const { department, semester } = req.params;
    const nextCode = await getNextCourseCode(department, semester);
    res.json({ nextCode });
  } catch (error) {
    return next(error);
  }
};

const getEnrolledStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    const { rows } = await db.query(
      `SELECT s.id,
              s.roll_no,
              s.full_name,
              s.department,
              s.semester,
              c.id AS course_id,
              c.code AS course_code,
              c.title AS course_title,
              r.marks,
              r.internal_marks,
              r.grade,
              r.result_status,
              r.is_published
       FROM registrations reg
       JOIN students s ON s.id = reg.student_id
       JOIN courses c ON c.id = reg.course_id
       LEFT JOIN results r ON r.student_id = s.id AND r.course_id = c.id
       WHERE reg.course_id = $1
       ORDER BY s.roll_no`,
      [courseId]
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

module.exports = { addCourse, listCourses, getEnrolledStudents, getNextCode };
