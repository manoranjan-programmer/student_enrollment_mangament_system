const db = require("./db");

async function checkCourses() {
  try {
    const { rows } = await db.query("SELECT * FROM courses");
    console.log("Courses:", rows);
    const { rows: columns } = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'");
    console.log("Columns:", columns.map(c => c.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkCourses();
