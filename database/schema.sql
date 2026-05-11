CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  email VARCHAR(120) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  department VARCHAR(100) NOT NULL,
  faculty_code VARCHAR(20) UNIQUE
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  credits INT NOT NULL CHECK (credits > 0),
  department VARCHAR(100) NOT NULL,
  faculty_id INT REFERENCES faculty(id) ON DELETE SET NULL,
  prerequisite_course_id INT REFERENCES courses(id) ON DELETE SET NULL,
  is_advanced BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  marks NUMERIC(5,2) NOT NULL CHECK (marks BETWEEN 0 AND 100),
  internal_marks NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (internal_marks BETWEEN 0 AND 100),
  grade CHAR(1),
  result_status VARCHAR(10),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent'))
);

CREATE OR REPLACE FUNCTION set_grade_and_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.marks >= 90 THEN
    NEW.grade := 'A';
  ELSIF NEW.marks >= 75 THEN
    NEW.grade := 'B';
  ELSIF NEW.marks >= 60 THEN
    NEW.grade := 'C';
  ELSE
    NEW.grade := 'F';
  END IF;

  IF NEW.marks >= 60 THEN
    NEW.result_status := 'Pass';
  ELSE
    NEW.result_status := 'Fail';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_grade_and_status ON results;
CREATE TRIGGER trg_set_grade_and_status
BEFORE INSERT OR UPDATE ON results
FOR EACH ROW
EXECUTE FUNCTION set_grade_and_status();

CREATE OR REPLACE FUNCTION safe_insert_result(
  p_student_id INT,
  p_course_id INT,
  p_marks NUMERIC,
  p_internal_marks NUMERIC
)
RETURNS INT AS $$
DECLARE
  inserted_id INT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM results
    WHERE student_id = p_student_id AND course_id = p_course_id
  ) THEN
    RAISE EXCEPTION 'Result already exists for student % and course %', p_student_id, p_course_id;
  END IF;

  INSERT INTO results (student_id, course_id, marks, internal_marks)
  VALUES (p_student_id, p_course_id, p_marks, p_internal_marks)
  RETURNING id INTO inserted_id;

  RETURN inserted_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW student_result_view AS
SELECT
  r.id AS result_id,
  s.id AS student_id,
  s.full_name AS student_name,
  c.id AS course_id,
  c.code AS course_code,
  c.title AS course_title,
  c.credits,
  r.marks,
  r.internal_marks,
  r.grade,
  r.result_status,
  r.is_published
FROM results r
JOIN students s ON s.id = r.student_id
JOIN courses c ON c.id = r.course_id;

CREATE OR REPLACE VIEW faculty_course_view AS
SELECT
  f.id AS faculty_id,
  f.full_name AS faculty_name,
  c.id AS course_id,
  c.code AS course_code,
  c.title AS course_title,
  c.credits
FROM faculty f
JOIN courses c ON c.faculty_id = f.id;

INSERT INTO users (role, email, password)
VALUES
  ('admin', 'admin@college.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('student', 'student@college.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role, email, password)
SELECT
  'faculty',
  LOWER(f.faculty_code) || '@college.com',
  '$2a$10$1K2trbDR8rFnnAmwjbk7ReXP6uQbg.x.BcG5pZ/kAwQw6tUYmFGha'
FROM (VALUES
  ('AD001','Artificial Intelligence and Data Science','AD Faculty 1'),
  ('AD002','Artificial Intelligence and Data Science','AD Faculty 2'),
  ('AD003','Artificial Intelligence and Data Science','AD Faculty 3'),
  ('AD004','Artificial Intelligence and Data Science','AD Faculty 4'),
  ('AD005','Artificial Intelligence and Data Science','AD Faculty 5'),
  ('CS001','Computer Science','CS Faculty 1'),
  ('CS002','Computer Science','CS Faculty 2'),
  ('CS003','Computer Science','CS Faculty 3'),
  ('CS004','Computer Science','CS Faculty 4'),
  ('CS005','Computer Science','CS Faculty 5'),
  ('IT001','Information Technology','IT Faculty 1'),
  ('IT002','Information Technology','IT Faculty 2'),
  ('IT003','Information Technology','IT Faculty 3'),
  ('IT004','Information Technology','IT Faculty 4'),
  ('IT005','Information Technology','IT Faculty 5'),
  ('EC001','Electronics and Communication','EC Faculty 1'),
  ('EC002','Electronics and Communication','EC Faculty 2'),
  ('EC003','Electronics and Communication','EC Faculty 3'),
  ('EC004','Electronics and Communication','EC Faculty 4'),
  ('EC005','Electronics and Communication','EC Faculty 5'),
  ('ME001','Mechanical Engineering','ME Faculty 1'),
  ('ME002','Mechanical Engineering','ME Faculty 2'),
  ('ME003','Mechanical Engineering','ME Faculty 3'),
  ('ME004','Mechanical Engineering','ME Faculty 4'),
  ('ME005','Mechanical Engineering','ME Faculty 5'),
  ('CE001','Civil Engineering','CE Faculty 1'),
  ('CE002','Civil Engineering','CE Faculty 2'),
  ('CE003','Civil Engineering','CE Faculty 3'),
  ('CE004','Civil Engineering','CE Faculty 4'),
  ('CE005','Civil Engineering','CE Faculty 5')
) AS f(faculty_code, department, full_name)
ON CONFLICT (email) DO NOTHING;

INSERT INTO faculty (user_id, full_name, department, faculty_code)
SELECT
  u.id,
  f.full_name,
  f.department,
  f.faculty_code
FROM users u
JOIN (VALUES
  ('AD001','Artificial Intelligence and Data Science','AD Faculty 1'),
  ('AD002','Artificial Intelligence and Data Science','AD Faculty 2'),
  ('AD003','Artificial Intelligence and Data Science','AD Faculty 3'),
  ('AD004','Artificial Intelligence and Data Science','AD Faculty 4'),
  ('AD005','Artificial Intelligence and Data Science','AD Faculty 5'),
  ('CS001','Computer Science','CS Faculty 1'),
  ('CS002','Computer Science','CS Faculty 2'),
  ('CS003','Computer Science','CS Faculty 3'),
  ('CS004','Computer Science','CS Faculty 4'),
  ('CS005','Computer Science','CS Faculty 5'),
  ('IT001','Information Technology','IT Faculty 1'),
  ('IT002','Information Technology','IT Faculty 2'),
  ('IT003','Information Technology','IT Faculty 3'),
  ('IT004','Information Technology','IT Faculty 4'),
  ('IT005','Information Technology','IT Faculty 5'),
  ('EC001','Electronics and Communication','EC Faculty 1'),
  ('EC002','Electronics and Communication','EC Faculty 2'),
  ('EC003','Electronics and Communication','EC Faculty 3'),
  ('EC004','Electronics and Communication','EC Faculty 4'),
  ('EC005','Electronics and Communication','EC Faculty 5'),
  ('ME001','Mechanical Engineering','ME Faculty 1'),
  ('ME002','Mechanical Engineering','ME Faculty 2'),
  ('ME003','Mechanical Engineering','ME Faculty 3'),
  ('ME004','Mechanical Engineering','ME Faculty 4'),
  ('ME005','Mechanical Engineering','ME Faculty 5'),
  ('CE001','Civil Engineering','CE Faculty 1'),
  ('CE002','Civil Engineering','CE Faculty 2'),
  ('CE003','Civil Engineering','CE Faculty 3'),
  ('CE004','Civil Engineering','CE Faculty 4'),
  ('CE005','Civil Engineering','CE Faculty 5')
) AS f(faculty_code, department, full_name)
  ON u.email = LOWER(f.faculty_code) || '@college.com'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  faculty_code = EXCLUDED.faculty_code;

INSERT INTO students (user_id, roll_no, full_name, department, semester)
SELECT id, 'CS2026-001', 'Rahul Verma', 'Computer Science', 4
FROM users WHERE email = 'student@college.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO courses (code, title, credits, faculty_id, prerequisite_course_id, is_advanced)
VALUES
  ('CS101', 'Programming Fundamentals', 4, 1, NULL, FALSE),
  ('CS201', 'Data Structures', 4, 1, 1, FALSE),
  ('CS301', 'Advanced Algorithms', 4, 1, 2, TRUE)
ON CONFLICT (code) DO NOTHING;
