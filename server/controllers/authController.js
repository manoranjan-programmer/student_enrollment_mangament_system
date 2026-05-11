const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { findUserByEmail, findUserByStudentId, findUserByFacultyId } = require("../models/userModel");

const login = async (req, res, next) => {
  try {
    const { email, student_id, login_id, password } = req.body;
    const loginId = String(login_id || student_id || email || "").trim();
    if (!loginId || !password) {
      return res.status(400).json({ message: "Login ID and password are required" });
    }

    let user;
    if (loginId.includes("@")) {
      user = await findUserByEmail(loginId.toLowerCase());
    } else {
      user = await findUserByFacultyId(loginId.toUpperCase());
      if (!user) {
        user = await findUserByStudentId(loginId);
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid login ID" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const profile = { student_id: null, faculty_id: null, department: null };
    if (user.role === "student") {
      const student = await db.query(
        "SELECT id, department, roll_no FROM students WHERE user_id = $1",
        [user.id]
      );
      profile.student_id = student.rows[0]?.id || null;
      profile.department = student.rows[0]?.department || null;
      profile.roll_no = student.rows[0]?.roll_no || null;
    }
    if (user.role === "faculty") {
      const faculty = await db.query(
        "SELECT id, faculty_code, department FROM faculty WHERE user_id = $1",
        [user.id]
      );
      profile.faculty_id = faculty.rows[0]?.id || null;
      profile.faculty_code = faculty.rows[0]?.faculty_code || null;
      profile.department = faculty.rows[0]?.department || null;
    }

    return res.json({
      token,
      user: { id: user.id, role: user.role, email: user.email, ...profile }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login };
