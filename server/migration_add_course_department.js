const db = require("./db");

async function migrate() {
  try {
    console.log("Starting migration: Add department to courses...");
    
    // Add column
    await db.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS department VARCHAR(100)");
    
    // Update existing courses based on codes
    await db.query(`
      UPDATE courses 
      SET department = 'Artificial Intelligence and Data Science' 
      WHERE code LIKE 'AD%' OR code LIKE 'U21AD%'
    `);
    
    await db.query(`
      UPDATE courses 
      SET department = 'Computer Science' 
      WHERE code LIKE 'CS%' AND department IS NULL
    `);

    await db.query(`
      UPDATE courses 
      SET department = 'Information Technology' 
      WHERE code LIKE 'IT%' AND department IS NULL
    `);

    await db.query(`
      UPDATE courses 
      SET department = 'Electronics and Communication' 
      WHERE code LIKE 'EC%' AND department IS NULL
    `);

    await db.query(`
      UPDATE courses 
      SET department = 'Mechanical Engineering' 
      WHERE code LIKE 'ME%' AND department IS NULL
    `);

    await db.query(`
      UPDATE courses 
      SET department = 'Civil Engineering' 
      WHERE code LIKE 'CE%' AND department IS NULL
    `);

    // Set a default for any remaining
    await db.query(`
      UPDATE courses 
      SET department = 'Computer Science' 
      WHERE department IS NULL
    `);

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
