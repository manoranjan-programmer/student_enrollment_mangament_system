const db = require('./db');

(async () => {
  try {
    const results = await db.query('SELECT * FROM results');
    console.log('--- Results Table ---');
    console.table(results.rows);
    
    const students = await db.query('SELECT * FROM students');
    console.log('\n--- Students Table ---');
    console.table(students.rows);
    
    const courses = await db.query('SELECT * FROM courses');
    console.log('\n--- Courses Table ---');
    console.table(courses.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
