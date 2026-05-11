const bcrypt = require("bcryptjs");
const db = require("../db");
const { getStudents } = require("../models/studentModel");

const addStudent = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { email, password, roll_no, full_name, department, semester } = req.body;
    await client.query("BEGIN");

    const hashed = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (role, email, password) VALUES ('student', $1, $2) RETURNING id`,
      [email, hashed]
    );

    const studentResult = await client.query(
      `INSERT INTO students (user_id, roll_no, full_name, department, semester)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userResult.rows[0].id, roll_no, full_name, department, semester]
    );

    await client.query("COMMIT");
    return res.status(201).json(studentResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

const listStudents = async (req, res, next) => {
  try {
    let query;
    let params = [];

    if (req.user?.role === "faculty") {
      // Show students enrolled in courses handled by this faculty in their department
      query = `
        SELECT DISTINCT s.*, u.email
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN registrations r ON r.student_id = s.id
        JOIN courses c ON c.id = r.course_id
        WHERE c.faculty_id = (SELECT id FROM faculty WHERE user_id = $1)
          AND s.department = (SELECT department FROM faculty WHERE user_id = $1)
        ORDER BY s.id DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT s.*, u.email
        FROM students s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.id DESC
      `;
    }

    const { rows } = await db.query(query, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

const getNextRoll = async (req, res, next) => {
  try {
    const { department, year } = req.params;
    const { getNextRollNo } = require("../models/studentModel");
    const nextRoll = await getNextRollNo(department, year);
    res.json({ nextRoll });
  } catch (error) {
    next(error);
  }
};

module.exports = { addStudent, listStudents, getNextRoll };
