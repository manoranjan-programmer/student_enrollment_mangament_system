const db = require("../db");

const gradePointsMap = { A: 10, B: 8, C: 6, F: 0 };

const uploadMarks = async (req, res, next) => {
  try {
    const { student_id, course_id, marks, internal_marks = 0 } = req.body;
    if (req.user?.role === "faculty") {
      const check = await db.query(
        `SELECT 1
         FROM courses c
         WHERE c.id = $1 AND c.department = (SELECT department FROM faculty WHERE user_id = $2)`,
        [course_id, req.user.id]
      );
      if (check.rowCount === 0) {
        return res.status(403).json({ message: "You can manage results only for courses in your department" });
      }
    }
    const { rows } = await db.query(
      `INSERT INTO results (student_id, course_id, marks, internal_marks, is_published, published_at)
       VALUES ($1, $2, $3, $4, TRUE, NOW())
       ON CONFLICT (student_id, course_id) 
       DO UPDATE SET 
         marks = EXCLUDED.marks, 
         internal_marks = EXCLUDED.internal_marks,
         is_published = TRUE,
         published_at = NOW(),
         created_at = NOW()
       RETURNING id AS result_id`,
      [student_id, course_id, marks, internal_marks]
    );
    return res.status(201).json({ result_id: rows[0].result_id });
  } catch (error) {
    return next(error);
  }
};

const publishResults = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    if (req.user?.role === "faculty") {
      if (!course_id) {
        return res.status(400).json({ message: "course_id is required for faculty publish" });
      }
      await db.query(
        `UPDATE results res
         SET is_published = TRUE, published_at = NOW()
         FROM courses c
         WHERE res.course_id = c.id
           AND c.id = $1
           AND c.department = (SELECT department FROM faculty WHERE user_id = $2)`,
        [course_id, req.user.id]
      );
    } else {
      await db.query(`UPDATE results SET is_published = TRUE, published_at = NOW()`);
    }
    return res.json({ message: "Results published successfully" });
  } catch (error) {
    return next(error);
  }
};

const getResults = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const params = [];
    let where = "";
    if (studentId) {
      params.push(studentId);
      where = "WHERE rv.student_id = $1";
      if (req.user?.role === "student") {
        where += " AND rv.is_published = TRUE";
      }
    }
    if (req.user?.role === "faculty") {
      params.push(req.user.id);
      const deptFilter = `rv.student_id IN (SELECT s.id FROM students s WHERE s.department = (SELECT department FROM faculty WHERE user_id = $${params.length}))`;
      where = where ? `${where} AND ${deptFilter}` : `WHERE ${deptFilter}`;
    }

    const resultRows = await db.query(
      `SELECT * FROM student_result_view rv ${where} ORDER BY rv.student_id, rv.course_code`,
      params
    );

    const grouped = {};
    resultRows.rows.forEach((row) => {
      if (!grouped[row.student_id]) {
        grouped[row.student_id] = {
          student_id: row.student_id,
          student_name: row.student_name,
          records: [],
          gpa: 0,
          cgpa: 0,
          backlogs: 0
        };
      }
      grouped[row.student_id].records.push(row);
    });

    Object.values(grouped).forEach((s) => {
      const credits = s.records.reduce((acc, r) => acc + Number(r.credits), 0);
      const weightedPoints = s.records.reduce(
        (acc, r) => acc + gradePointsMap[r.grade] * Number(r.credits),
        0
      );
      s.backlogs = s.records.filter((r) => r.result_status === "Fail").length;
      s.gpa = credits ? Number((weightedPoints / credits).toFixed(2)) : 0;
      s.cgpa = s.gpa;
    });

    return res.json(Object.values(grouped));
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadMarks, publishResults, getResults };
