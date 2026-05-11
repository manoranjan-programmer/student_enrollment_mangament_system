import React, { useState, useEffect } from "react";
import api from "../services/api";

const Registration = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const isStudent = user.role === "student";

  const getDeptFromRoll = (roll) => {
    if (!roll) return null;
    const rollStr = String(roll).toUpperCase();
    const prefix = rollStr.substring(0, 2);
    const mapping = {
      "AD": "Artificial Intelligence and Data Science",
      "CS": "Computer Science",
      "IT": "Information Technology",
      "EC": "Electronics and Communication",
      "ME": "Mechanical Engineering",
      "CE": "Civil Engineering"
    };
    return mapping[prefix];
  };

  const studentDept = user.department || 
                      getDeptFromRoll(user.roll_no) || 
                      getDeptFromRoll(user.student_id) || 
                      getDeptFromRoll(localStorage.getItem("login_id"));

  const [courses, setCourses] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    if (isStudent) { fetchMyRegistrations(); }
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      let data = res.data;
      if (isStudent && studentDept) {
        data = data.filter(c => c.department === studentDept);
      } else if (isStudent && !studentDept) {
        data = [];
      }
      setCourses(data);
    } catch (err) { console.error("Failed to fetch courses"); }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get(`/registrations/student/${user.student_id}`);
      setMyRegistrations(res.data);
    } catch (err) { console.error("Failed to fetch registrations"); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    const finalCourseId = Number(courseId);
    if (!finalCourseId) { setMessage("Please select a course"); setMsgType("error"); return; }

    let payload = { course_id: finalCourseId };
    if (isAdmin) {
      if (!studentId) { setMessage("Please enter a Student ID"); setMsgType("error"); return; }
      payload.student_id = Number(studentId);
    } else {
      if (!user.student_id) { setMessage("Student profile not found."); setMsgType("error"); return; }
      payload.student_id = Number(user.student_id);
    }

    setLoading(true);
    try {
      await api.post("/register", payload);
      setMessage("✓ Registration completed successfully.");
      setMsgType("success");
      setCourseId("");
      setStudentId("");
      if (isStudent) fetchMyRegistrations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMsgType("error");
    } finally { setLoading(false); }
  };

  return (
    <div className="registration-page">
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          Student Enrollment Portal
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Registration Terminal
        </h1>
      </div>

      <div className="grid-two" style={{ alignItems: "flex-start" }}>
        <section className="left-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{ width: "32px", height: "32px", background: "#f0fdf4", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  📝
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>Course Selection</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "42px" }}>Select courses from your department catalog</p>
            </div>

            {message && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", fontWeight: "600",
                background: msgType === "success" ? "#f0fdf4" : "#fef2f2",
                color: msgType === "success" ? "#16a34a" : "#dc2626",
                border: `1px solid ${msgType === "success" ? "#bbf7d0" : "#fecaca"}`
              }}>
                {message}
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {isStudent && user.department && (
                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Enrollment Unit</p>
                  <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--primary)" }}>{user.department}</p>
                </div>
              )}

              {isAdmin && (
                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Student Institutional ID
                  </label>
                  <input
                    type="number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter ID (e.g. 42)"
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              )}

              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Curriculum Catalog Item
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="">— Select Academic Course —</option>
                  {courses.filter(c => {
                    if (isAdmin) return true;
                    return !myRegistrations.some(reg => reg.course_id === c.id);
                  }).map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px",
                  fontSize: "14px", fontWeight: "700", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Processing..." : "Confirm Registration"}
              </button>
            </form>
          </div>
        </section>

        <section className="right-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)", marginBottom: "24px" }}>
              {isStudent ? "Academic Load Summary" : "System Activity"}
            </h3>

            <div style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(isStudent ? myRegistrations : []).map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      padding: "16px 20px", border: "1.5px solid #f1f5f9", borderRadius: "14px", background: "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "4px" }}>
                        {reg.course_code}
                      </span>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginTop: "6px" }}>{reg.course_title}</h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
                        Active
                      </span>
                    </div>
                  </div>
                ))}
                {isStudent && myRegistrations.length === 0 && (
                  <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📚</div>
                    <p style={{ fontWeight: "600" }}>No courses registered yet</p>
                  </div>
                )}
                {!isStudent && (
                  <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚙️</div>
                    <p style={{ fontWeight: "600" }}>Admin Registry Monitor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Registration;
