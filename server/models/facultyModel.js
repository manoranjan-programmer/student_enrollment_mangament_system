const db = require("../db");

const getFaculty = async (department = "") => {
  let query = `
    SELECT f.*, u.email,
    (SELECT COUNT(c.id) FROM courses c WHERE c.faculty_id = f.id)::int as courses_count
    FROM faculty f
    JOIN users u ON u.id = f.user_id
  `;
  const params = [];
  if (department && department !== "All") {
    query += " WHERE f.department = $1";
    params.push(department);
  }
  query += " ORDER BY f.full_name ASC";
  const { rows } = await db.query(query, params);
  return rows;
};

const getFacultyStudents = async (facultyId) => {
  const { rows } = await db.query(
    `SELECT DISTINCT s.id, s.roll_no, s.full_name, s.department, s.semester, c.code as course_code
     FROM students s
     JOIN registrations r ON r.student_id = s.id
     JOIN courses c ON c.id = r.course_id
     WHERE c.faculty_id = $1
     ORDER BY s.full_name ASC`,
    [facultyId]
  );
  return rows;
};

const assignFacultyToCourse = async (facultyData) => {
  const { faculty_id, faculty_code, full_name, department, course_id, email: providedEmail } = facultyData;

  let facultyId = faculty_id;

  // 1. Check if user/faculty exists or use provided ID
  if (!facultyId) {
    if (!faculty_code) {
      throw new Error("Faculty identification (ID or Code) is missing");
    }

    let facultyResult = await db.query(
      "SELECT id FROM faculty WHERE faculty_code = $1",
      [faculty_code]
    );

    if (facultyResult.rowCount === 0) {
      // Create User first
      const email = providedEmail || `${faculty_code.toLowerCase()}@college.com`;
      const userResult = await db.query(
        "INSERT INTO users (role, email, password) VALUES ('faculty', $1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') RETURNING id",
        [email]
      );
      const userId = userResult.rows[0].id;

      // Create Faculty
      const newFaculty = await db.query(
        "INSERT INTO faculty (user_id, full_name, department, faculty_code) VALUES ($1, $2, $3, $4) RETURNING id",
        [userId, full_name, department, faculty_code]
      );
      facultyId = newFaculty.rows[0].id;
    } else {
      facultyId = facultyResult.rows[0].id;
    }
  }

  // 2. Assign to course
  if (course_id && facultyId) {
    // Check if course is already assigned to ANY faculty in the database
    const { rows: courseCheck } = await db.query(
      "SELECT faculty_id FROM courses WHERE id = $1 AND faculty_id IS NOT NULL",
      [course_id]
    );

    if (courseCheck.length > 0) {
      const currentId = courseCheck[0].faculty_id;
      // Only block if it's assigned to someone ELSE
      if (currentId !== null && Number(currentId) !== Number(facultyId)) {
        const error = new Error("Already a faculty member is handling this subject.");
        error.status = 400;
        throw error;
      }
    }

    await db.query(
      "UPDATE courses SET faculty_id = $1 WHERE id = $2",
      [facultyId, course_id]
    );
  }

  return { facultyId };
};

const getNextFacultyCode = async (department) => {
  const deptPrefixes = {
    "Artificial Intelligence and Data Science": "AD",
    "Computer Science": "CS",
    "Information Technology": "IT",
    "Electronics and Communication": "EC",
    "Mechanical Engineering": "ME",
    "Civil Engineering": "CE"
  };

  const prefix = deptPrefixes[department] || "FC";
  
  // Find the highest number for this prefix
  const { rows } = await db.query(
    "SELECT faculty_code FROM faculty WHERE faculty_code LIKE $1 ORDER BY faculty_code DESC LIMIT 1",
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (rows.length > 0 && rows[0].faculty_code) {
    const lastCode = rows[0].faculty_code;
    const match = lastCode.match(/\d+/);
    if (match) {
      nextNum = parseInt(match[0], 10) + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
};

const getFacultyByCode = async (code) => {
  const { rows: facultyRows } = await db.query(
    `SELECT f.*, u.email 
     FROM faculty f 
     JOIN users u ON u.id = f.user_id 
     WHERE f.faculty_code ILIKE $1`,
    [code]
  );
  
  if (facultyRows.length === 0) return null;
  
  const faculty = facultyRows[0];
  
  // Get courses
  const { rows: courses } = await db.query(
    "SELECT * FROM courses WHERE faculty_id = $1",
    [faculty.id]
  );
  
  // Get students
  const { rows: students } = await db.query(
    `SELECT DISTINCT s.id, s.roll_no, s.full_name, s.department, s.semester, c.code as course_code, c.title as course_title
     FROM students s
     JOIN registrations r ON r.student_id = s.id
     JOIN courses c ON c.id = r.course_id
     WHERE c.faculty_id = $1
     ORDER BY s.full_name ASC`,
    [faculty.id]
  );
  
  return {
    ...faculty,
    courses,
    students
  };
};

module.exports = { getFaculty, getFacultyStudents, assignFacultyToCourse, getNextFacultyCode, getFacultyByCode };
