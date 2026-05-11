const db = require("./db");

const seedCourses = async () => {
  const departments = [
    { code: "AD", name: "Artificial Intelligence and Data Science", titles: ["Machine Learning", "Data Mining", "Neural Networks", "Computer Vision", "Natural Language Processing"] },
    { code: "CS", name: "Computer Science", titles: ["Operating Systems", "Database Management", "Compiler Design", "Theory of Computation", "Web Technologies"] },
    { code: "IT", name: "Information Technology", titles: ["Network Security", "Cloud Computing", "Mobile App Development", "Distributed Systems", "Software Engineering"] },
    { code: "EC", name: "Electronics and Communication", titles: ["Digital Electronics", "Microprocessors", "Control Systems", "Digital Signal Processing", "VLSI Design"] },
    { code: "ME", name: "Mechanical Engineering", titles: ["Thermodynamics", "Fluid Mechanics", "Kinematics of Machinery", "CAD/CAM", "Manufacturing Technology"] },
    { code: "CE", name: "Civil Engineering", titles: ["Structural Analysis", "Surveying", "Geotechnical Engineering", "Transportation Engineering", "Environmental Engineering"] }
  ];

  try {
    console.log("Starting Course Seeding...");

    for (const dept of departments) {
      // Fetch a faculty member from this department to assign
      const { rows: faculty } = await db.query(
        "SELECT id FROM faculty WHERE department = $1 LIMIT 1",
        [dept.name]
      );
      
      const facultyId = faculty.length > 0 ? faculty[0].id : null;

      for (let i = 0; i < 5; i++) {
        const semester = "04"; // As per user example
        const courseNum = String(i + 1).padStart(2, "0");
        const code = `${dept.code}${semester}-${courseNum}`;
        const title = dept.titles[i];
        const credits = 4;

        await db.query(
          `INSERT INTO courses (code, title, credits, department, faculty_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (code) DO UPDATE SET
             title = EXCLUDED.title,
             credits = EXCLUDED.credits,
             department = EXCLUDED.department,
             faculty_id = EXCLUDED.faculty_id`,
          [code, title, credits, dept.name, facultyId]
        );
      }
      console.log(`Seeded 5 courses for ${dept.name}`);
    }

    console.log("Course Seeding Completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit();
  }
};

seedCourses();
