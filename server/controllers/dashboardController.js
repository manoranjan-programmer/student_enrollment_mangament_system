const db = require("../db");

const getDashboard = async (req, res, next) => {
  try {
    if (req.user?.role === "student") {
      const profile = await db.query(
        `SELECT id, full_name, roll_no, department, semester
         FROM students
         WHERE user_id = $1`,
        [req.user.id]
      );

      if (profile.rowCount === 0) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const student = profile.rows[0];

      const courses = await db.query(
        `SELECT
           c.id AS course_id,
           c.code,
           c.title,
           c.credits,
           r.registered_at,
           res.marks,
           res.grade,
           res.result_status
         FROM registrations r
         JOIN courses c ON c.id = r.course_id
         LEFT JOIN results res ON res.student_id = r.student_id AND res.course_id = r.course_id
         WHERE r.student_id = $1
         ORDER BY c.code`,
        [student.id]
      );

      const summary = await db.query(
        `SELECT
           (SELECT COUNT(*) FROM registrations WHERE student_id = $1)::int AS enrolled_courses,
           COALESCE(ROUND(AVG(marks)::numeric, 2), 0) AS average_marks,
           COALESCE(SUM(CASE WHEN result_status = 'Pass' THEN 1 ELSE 0 END), 0)::int AS passed_courses
         FROM results
         WHERE student_id = $1`,
        [student.id]
      );

      return res.json({
        student: {
          full_name: student.full_name,
          roll_no: student.roll_no,
          department: student.department,
          semester: student.semester
        },
        summary: {
          enrolled_courses: Number(summary.rows[0]?.enrolled_courses || 0),
          average_marks: Number(summary.rows[0]?.average_marks || 0),
          passed_courses: Number(summary.rows[0]?.passed_courses || 0)
        },
        enrolled_courses: courses.rows
      });
    }
    if (req.user?.role === "faculty") {
      const facultyProfile = await db.query(
        `SELECT id, full_name, department, faculty_code
         FROM faculty
         WHERE user_id = $1`,
        [req.user.id]
      );
      if (facultyProfile.rowCount === 0) {
        return res.status(404).json({ message: "Faculty profile not found" });
      }
      const faculty = facultyProfile.rows[0];
      const courses = await db.query(
        `SELECT
           c.id AS course_id,
           c.code,
           c.title,
           COUNT(r.student_id)::int AS enrolled_students
         FROM courses c
         LEFT JOIN registrations r ON r.course_id = c.id
         WHERE c.faculty_id = $1 AND c.department = $2
         GROUP BY c.id, c.code, c.title
         ORDER BY c.code`,
        [faculty.id, faculty.department]
      );
      const attendance = await db.query(
        `SELECT a.status, COUNT(*)::int AS count
         FROM attendance a
         JOIN courses c ON c.id = a.course_id
         WHERE c.faculty_id = $1 AND c.department = $2
         GROUP BY a.status`,
        [faculty.id, faculty.department]
      );

      return res.json({
        faculty,
        summary: {
          subjects_handled: courses.rowCount,
          total_students: courses.rows.reduce((acc, item) => acc + Number(item.enrolled_students), 0)
        },
        courses: courses.rows,
        attendance_breakdown: attendance.rows
      });
    }

    const topper = await db.query(
      `SELECT student_name, AVG(marks) AS avg_marks
       FROM student_result_view
       GROUP BY student_name
       ORDER BY avg_marks DESC
       LIMIT 1`
    );

    const stats = await db.query(
      `SELECT
         COALESCE(ROUND(AVG(marks)::numeric, 2), 0) AS average_marks,
         COALESCE(ROUND((SUM(CASE WHEN result_status = 'Pass' THEN 1 ELSE 0 END)::numeric
          / NULLIF(COUNT(*), 0)) * 100, 2), 0) AS pass_percentage
       FROM results
       WHERE is_published = TRUE`
    );

    const attendance = await db.query(
      `SELECT status, COUNT(*)::int AS count
       FROM attendance
       GROUP BY status`
    );

    const trend = await db.query(
      `SELECT c.code AS subject, AVG(r.marks)::numeric(5,2) AS average_marks
       FROM results r
       JOIN courses c ON c.id = r.course_id
       GROUP BY c.code
       ORDER BY c.code`
    );

    return res.json({
      topper: topper.rows[0] || null,
      average_marks: Number(stats.rows[0].average_marks || 0),
      pass_percentage: Number(stats.rows[0].pass_percentage || 0),
      attendance_breakdown: attendance.rows,
      marks_trend: trend.rows
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboard };
