const db = require("../db");

const createStudent = async ({ user_id, roll_no, full_name, department, semester }) => {
  const { rows } = await db.query(
    `INSERT INTO students (user_id, roll_no, full_name, department, semester)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, roll_no, full_name, department, semester]
  );
  return rows[0];
};

const getStudents = async () => {
  const { rows } = await db.query(
    `SELECT s.*, u.email
     FROM students s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.id DESC`
  );
  return rows;
};

const getNextRollNo = async (department, year) => {
  const deptPrefixes = {
    "Artificial Intelligence and Data Science": "AD",
    "Computer Science": "CS",
    "Information Technology": "IT",
    "Electronics and Communication": "EC",
    "Mechanical Engineering": "ME",
    "Civil Engineering": "CE"
  };

  const prefix = deptPrefixes[department] || "ST";
  const yearStr = year || "2026";
  const pattern = `${prefix}${yearStr}-%`;
  
  const { rows } = await db.query(
    "SELECT roll_no FROM students WHERE roll_no LIKE $1 ORDER BY roll_no DESC LIMIT 1",
    [pattern]
  );

  let nextNum = 1;
  if (rows.length > 0) {
    const lastRoll = rows[0].roll_no;
    const parts = lastRoll.split("-");
    if (parts.length > 1) {
      nextNum = (parseInt(parts[1], 10) || 0) + 1;
    }
  }

  return `${prefix}${yearStr}-${String(nextNum).padStart(2, "0")}`;
};

module.exports = { createStudent, getStudents, getNextRollNo };
