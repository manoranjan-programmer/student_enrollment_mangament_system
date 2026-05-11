const db = require("../db");

const findUserByEmail = async (email) => {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0];
};

const findUserByStudentId = async (studentId) => {
  const { rows } = await db.query(
    `SELECT u.*
     FROM users u
     JOIN students s ON s.user_id = u.id
     WHERE s.roll_no = $1`,
    [studentId]
  );
  return rows[0];
};

const findUserByFacultyId = async (facultyId) => {
  const { rows } = await db.query(
    `SELECT u.*
     FROM users u
     JOIN faculty f ON f.user_id = u.id
     WHERE f.faculty_code = $1`,
    [facultyId]
  );
  return rows[0];
};

module.exports = { findUserByEmail, findUserByStudentId, findUserByFacultyId };
