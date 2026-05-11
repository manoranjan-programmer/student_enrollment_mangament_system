const db = require("../db");

const createCourse = async (payload) => {
  const { code, title, credits, department, faculty_id, prerequisite_course_id, is_advanced } = payload;
  const { rows } = await db.query(
    `INSERT INTO courses (code, title, credits, department, faculty_id, prerequisite_course_id, is_advanced)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [code, title, credits, department, faculty_id || null, prerequisite_course_id || null, !!is_advanced]
  );
  return rows[0];
};

const getCourses = async () => {
  const { rows } = await db.query(
    `SELECT c.*, c.department, f.id AS faculty_id, f.full_name AS faculty_name, p.code AS prerequisite_code
     FROM courses c
     LEFT JOIN faculty f ON f.id = c.faculty_id
     LEFT JOIN courses p ON p.id = c.prerequisite_course_id
     ORDER BY c.id DESC`
  );
  return rows;
};

const getNextCourseCode = async (department, semester) => {
  const deptPrefixes = {
    "Artificial Intelligence and Data Science": "AD",
    "Computer Science": "CS",
    "Information Technology": "IT",
    "Electronics and Communication": "EC",
    "Mechanical Engineering": "ME",
    "Civil Engineering": "CE"
  };

  const prefix = deptPrefixes[department] || "CO";
  const semPad = String(semester || 4).padStart(2, "0");
  const pattern = `${prefix}${semPad}-%`;
  
  const { rows } = await db.query(
    "SELECT code FROM courses WHERE code LIKE $1 ORDER BY code DESC LIMIT 1",
    [pattern]
  );

  let nextNum = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].code;
    const parts = lastCode.split("-");
    if (parts.length > 1) {
      nextNum = (parseInt(parts[1], 10) || 0) + 1;
    }
  }

  return `${prefix}${semPad}-${String(nextNum).padStart(2, "0")}`;
};

module.exports = { createCourse, getCourses, getNextCourseCode };
