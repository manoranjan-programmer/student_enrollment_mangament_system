const db = require("./db");

const debugSearch = async () => {
  try {
    const { rows } = await db.query("SELECT faculty_code, full_name FROM faculty LIMIT 5");
    console.log("Faculty in DB:", rows);
    
    if (rows.length > 0) {
        const testCode = rows[0].faculty_code;
        console.log(`Testing search for: "${testCode}"`);
        
        const { rows: facultyRows } = await db.query(
            `SELECT f.*, u.email 
             FROM faculty f 
             JOIN users u ON u.id = f.user_id 
             WHERE f.faculty_code = $1`,
            [testCode]
        );
        const faculty = facultyRows[0];
        console.log("Faculty Found:", faculty);
        
        const { rows: courses } = await db.query(
            "SELECT * FROM courses WHERE faculty_id = $1",
            [faculty.id]
        );
        console.log("Courses:", courses);
        
        const { rows: students } = await db.query(
            `SELECT DISTINCT s.id, s.roll_no, s.full_name, s.department, s.semester, c.code as course_code, c.title as course_title
             FROM students s
             JOIN registrations r ON r.student_id = s.id
             JOIN courses c ON c.id = r.course_id
             WHERE c.faculty_id = $1
             ORDER BY s.full_name ASC`,
            [faculty.id]
        );
        console.log("Students:", students);
    }
  } catch (err) {
    console.error("Debug Error:", err);
  } finally {
    process.exit();
  }
};

debugSearch();
