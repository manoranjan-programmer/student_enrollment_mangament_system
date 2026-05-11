const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const resultRoutes = require("./routes/resultRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/courses", courseRoutes);
app.use("/register", registrationRoutes);
app.use("/", resultRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/faculty", facultyRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const schemaPath = path.join(__dirname, "../database/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

const ensureFacultySetup = async () => {
  await db.query("ALTER TABLE faculty ADD COLUMN IF NOT EXISTS faculty_code VARCHAR(20)");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_faculty_faculty_code ON faculty(faculty_code)");

  const departments = [
    { code: "AD", name: "Artificial Intelligence and Data Science" },
    { code: "CS", name: "Computer Science" },
    { code: "IT", name: "Information Technology" },
    { code: "EC", name: "Electronics and Communication" },
    { code: "ME", name: "Mechanical Engineering" },
    { code: "CE", name: "Civil Engineering" }
  ];

  for (const dept of departments) {
    for (let idx = 1; idx <= 5; idx += 1) {
      const facultyCode = `${dept.code}${String(idx).padStart(3, "0")}`;
      const email = `${facultyCode.toLowerCase()}@college.com`;
      const fullName = `${dept.code} Faculty ${idx}`;

      await db.query(
        `INSERT INTO users (role, email, password)
         VALUES ('faculty', $1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
         ON CONFLICT (email) DO NOTHING`,
        [email]
      );

      await db.query(
        `INSERT INTO faculty (user_id, full_name, department, faculty_code)
         SELECT u.id, $1, $2, $3
         FROM users u
         WHERE u.email = $4
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           department = EXCLUDED.department,
           faculty_code = EXCLUDED.faculty_code`,
        [fullName, dept.name, facultyCode, email]
      );
    }
  }

  await db.query(
    `UPDATE faculty f
     SET faculty_code = COALESCE(f.faculty_code, CONCAT('FC', LPAD(f.id::text, 3, '0')))
     WHERE f.faculty_code IS NULL`
  );
};

const startServer = async () => {
  let connected = false;
  let retries = 5;
  
  while (retries > 0 && !connected) {
    connected = await db.testConnection();
    if (!connected) {
      retries -= 1;
      if (retries > 0) {
        console.log(`Retrying database connection in 3 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  if (!connected) {
    console.error("CRITICAL: Could not connect to database after multiple attempts. Exiting.");
    process.exit(1);
  }

  try {
    await db.query(schema);
    console.log("Schema executed");
  } catch (error) {
    console.error("Schema execution failed:", error.message);
  }
  
  try {
    await ensureFacultySetup();
  } catch (error) {
    console.error("Faculty setup failed:", error.message);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other server process and restart.`);
      return;
    }
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error("Bootstrap failed:", error.message);
  process.exit(1);
});
