const facultyModel = require("../models/facultyModel");

const listFaculty = async (req, res, next) => {
  try {
    const { department } = req.query;
    const faculty = await facultyModel.getFaculty(department);
    res.json(faculty);
  } catch (error) {
    next(error);
  }
};

const getEnrolledStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const students = await facultyModel.getFacultyStudents(id);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const assignFaculty = async (req, res, next) => {
  try {
    const result = await facultyModel.assignFacultyToCourse(req.body);
    res.status(201).json({ message: "Faculty assigned successfully", ...result });
  } catch (error) {
    next(error);
  }
};

const getNextCode = async (req, res, next) => {
  try {
    const { department } = req.params;
    const nextCode = await facultyModel.getNextFacultyCode(department);
    res.json({ nextCode });
  } catch (error) {
    next(error);
  }
};

const searchFaculty = async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: "Faculty code is required" });
    }
    const result = await facultyModel.getFacultyByCode(code);
    if (!result) {
      return res.status(404).json({ message: `Faculty member with code "${code}" not found` });
    }
    res.json(result);
  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ message: "Internal server error during search", error: error.message });
  }
};

module.exports = { listFaculty, getEnrolledStudents, assignFaculty, getNextCode, searchFaculty };
