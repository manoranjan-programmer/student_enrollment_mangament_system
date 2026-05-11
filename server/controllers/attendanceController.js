const db = require("../db");

const markAttendance = async (req, res, next) => {
  try {
    const { student_id, course_id, attendance_date, status } = req.body;
    if (req.user?.role === "faculty") {
      const ownsCourse = await db.query(
        `SELECT 1
         FROM courses c
         WHERE c.id = $1 AND c.faculty_id = (SELECT id FROM faculty WHERE user_id = $2)`,
        [course_id, req.user.id]
      );
      if (ownsCourse.rowCount === 0) {
        return res.status(403).json({ message: "You can mark attendance only for courses assigned to you" });
      }
    }
    const { rows } = await db.query(
      `INSERT INTO attendance (student_id, course_id, attendance_date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [student_id, course_id, attendance_date, status]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

const getAttendanceRoster = async (req, res, next) => {
  try {
    const { course_id, attendance_date } = req.query;
    const params = [];
    let where = "";
    if (req.user?.role === "faculty") {
      params.push(req.user.id);
      where = `WHERE c.faculty_id = (SELECT id FROM faculty WHERE user_id = $${params.length})`;
    }
    if (course_id) {
      params.push(Number(course_id));
      where += where ? ` AND c.id = $${params.length}` : `WHERE c.id = $${params.length}`;
    }

    const dateParamIndex = params.length + 1;
    if (attendance_date) {
      params.push(attendance_date);
    }

    const roster = await db.query(
      `SELECT
         c.id AS course_id,
         c.code AS course_code,
         c.title AS course_title,
         c.faculty_id,
         s.id AS student_id,
         s.roll_no,
         s.full_name,
         (SELECT a.status FROM attendance a 
          WHERE a.student_id = s.id AND a.course_id = c.id 
          AND a.attendance_date = ${attendance_date ? `$${dateParamIndex}` : 'NULL'} 
          LIMIT 1) as current_status
       FROM courses c
       LEFT JOIN registrations r ON r.course_id = c.id
       LEFT JOIN students s ON s.id = r.student_id
       ${where}
       ORDER BY c.code, s.roll_no`,
      params
    );

    return res.json(roster.rows);
  } catch (error) {
    return next(error);
  }
};

module.exports = { markAttendance, getAttendanceRoster };
