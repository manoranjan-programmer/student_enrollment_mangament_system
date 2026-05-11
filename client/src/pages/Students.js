import React, { useEffect, useState } from "react";
import api from "../services/api";

const Students = ({ role }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [students, setStudents] = useState([]);
  const [selectedStudentResults, setSelectedStudentResults] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error"
  const [filterDept, setFilterDept] = useState(
    role === "faculty" ? (user.department || "All") : "All"
  );
  const isStudent = role === "student";

  const [form, setForm] = useState({
    email: "",
    password: "Password@123",
    roll_no: "",
    full_name: "",
    department: "Computer Science",
    semester: 1
  });

  const departments = [
    "All",
    "Artificial Intelligence and Data Science",
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering"
  ];

  const deptAbbr = {
    "Artificial Intelligence and Data Science": "AI&DS",
    "Computer Science": "CSE",
    "Information Technology": "IT",
    "Electronics and Communication": "ECE",
    "Mechanical Engineering": "MECH",
    "Civil Engineering": "CIVIL"
  };

  const fetchNextRoll = async (dept) => {
    if (!dept || dept === "All") return;
    try {
      const year = "2026";
      const res = await api.get(`/students/next-roll/${encodeURIComponent(dept)}/${year}`);
      const nextRoll = res.data.nextRoll;
      setForm(prev => ({ 
        ...prev, 
        department: dept, 
        roll_no: nextRoll,
        email: `${nextRoll.toLowerCase()}@college.com`
      }));
    } catch (err) {
      console.error("Failed to fetch next roll number", err);
    }
  };

  const load = () => api.get("/students")
    .then((r) => {
      setStudents(r.data);
      setMessage("");
    })
    .catch((err) => { setMessage(err.response?.data?.message || "Failed to load students"); setMsgType("error"); });

  const fetchStudentResults = (studentId) => {
    api.get(`/results?studentId=${studentId}`)
      .then((r) => {
        if (r.data.length > 0) {
          setSelectedStudentResults(r.data[0]);
        } else {
          setSelectedStudentResults({ student_name: "No Record Found", records: [], gpa: 0, cgpa: 0, backlogs: 0 });
        }
      })
      .catch(() => { setMessage("Failed to load student transcript"); setMsgType("error"); });
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", form);
      setForm({ ...form, email: "", roll_no: "", full_name: "" });
      setMessage("✓ Student enrolled successfully.");
      setMsgType("success");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save student record.");
      setMsgType("error");
    }
  };

  const filteredStudents = students.filter(s => {
    return filterDept === "All" || s.department === filterDept;
  });

  const getDeptColor = (dept) => {
    const colors = {
      "Artificial Intelligence and Data Science": { bg: "#eff6ff", text: "#2563eb" },
      "Computer Science": { bg: "#f0fdf4", text: "#16a34a" },
      "Information Technology": { bg: "#fdf4ff", text: "#9333ea" },
      "Electronics and Communication": { bg: "#fff7ed", text: "#ea580c" },
      "Mechanical Engineering": { bg: "#fef2f2", text: "#dc2626" },
      "Civil Engineering": { bg: "#f0fdfa", text: "#0d9488" }
    };
    return colors[dept] || { bg: "#f8fafc", text: "#64748b" };
  };

  return (
    <div className="students-page">
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          Academic Operations Dashboard
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Student Management
        </h1>
      </div>

      <div className={role === "admin" ? "grid-two" : ""} style={{ alignItems: "flex-start" }}>

        {/* ── LEFT PANEL: Enrollment Form (Admin only) ── */}
        {role === "admin" && (
          <section className="left-panel">
            <div className="glass-card" style={{ padding: "28px" }}>
              {/* Form Header */}
              <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <div style={{ width: "32px", height: "32px", background: "#eff6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    👤
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>
                    New Student Enrollment
                  </h3>
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "42px" }}>
                  Complete all fields to register a new student
                </p>
              </div>

              {/* Status Message */}
              {message && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: msgType === "success" ? "#f0fdf4" : "#fef2f2",
                  color: msgType === "success" ? "#16a34a" : "#dc2626",
                  border: `1px solid ${msgType === "success" ? "#bbf7d0" : "#fecaca"}`
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    placeholder="Enter student's full name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Institutional Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@college.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                      Department <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      required
                      value={form.department}
                      onChange={(e) => fetchNextRoll(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                    >
                      {departments.filter(d => d !== "All").map(d => (
                        <option key={d} value={d}>{deptAbbr[d] || d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                      Semester <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      required
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Roll Number
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      placeholder="Auto-generated on department select"
                      value={form.roll_no}
                      readOnly
                      required
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", background: "#f8fafc", color: "#475569", fontWeight: "600", cursor: "default", boxSizing: "border-box" }}
                    />
                    {form.roll_no && (
                      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                        AUTO
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={e => e.target.style.opacity = "0.9"}
                  onMouseLeave={e => e.target.style.opacity = "1"}
                >
                  ＋ Enroll Student
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ── RIGHT PANEL: Student Registry ── */}
        <section className="right-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            {/* Registry Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Student Registry</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  {filteredStudents.length} record{filteredStudents.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {role === "admin" && (
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    style={{ padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", fontWeight: "500", minWidth: "160px" }}
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d === "All" ? "All Departments" : deptAbbr[d] || d}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Student List */}
            <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredStudents.map((s) => {
                  const deptColor = getDeptColor(s.department);
                  const isActive = selectedStudentResults?.student_id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => fetchStudentResults(s.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 18px",
                        border: isActive ? "1.5px solid #2563eb" : "1.5px solid #f1f5f9",
                        borderRadius: "12px",
                        background: isActive ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isActive ? "0 0 0 3px rgba(37,99,235,0.08)" : "none"
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = "#cbd5e1"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = "#f1f5f9"; }}
                    >
                      {/* Avatar + Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                          width: "40px", height: "40px",
                          background: deptColor.bg,
                          color: deptColor.text,
                          borderRadius: "10px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "800", fontSize: "16px", flexShrink: 0
                        }}>
                          {s.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "3px" }}>{s.full_name}</h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: "700",
                              background: deptColor.bg, color: deptColor.text,
                              padding: "2px 7px", borderRadius: "4px"
                            }}>
                              {deptAbbr[s.department] || s.department}
                            </span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Semester {s.semester}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Info */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{s.roll_no}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{s.email}</div>
                      </div>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎓</div>
                    <p style={{ fontWeight: "600" }}>No student records found</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Try changing the department filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          {selectedStudentResults && (
            <div className="glass-card" style={{ marginTop: "20px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)" }}>
                    Academic Transcript
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{selectedStudentResults.student_name}</p>
                </div>
                <button
                  onClick={() => setSelectedStudentResults(null)}
                  style={{ padding: "6px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "#64748b" }}
                >
                  ✕ Close
                </button>
              </div>

              {selectedStudentResults.records.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", padding: "20px", textAlign: "center" }}>No results published for this student yet.</p>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden" }}>
                    <thead>
                      <tr style={{ background: "var(--primary)", color: "#fff" }}>
                        <th style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Course</th>
                        <th style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Marks</th>
                        <th style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Grade</th>
                        <th style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentResults.records.map((rec, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "11px 14px", fontSize: "13px" }}>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>{rec.course_code}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{rec.course_title}</div>
                          </td>
                          <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>{rec.marks}</td>
                          <td style={{ padding: "11px 14px", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{rec.grade}</td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: "700",
                              padding: "3px 10px", borderRadius: "6px",
                              background: rec.result_status === "Pass" ? "#f0fdf4" : "#fef2f2",
                              color: rec.result_status === "Pass" ? "#16a34a" : "#dc2626"
                            }}>
                              {rec.result_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: "flex", gap: "20px", marginTop: "18px", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
                    {[
                      { label: "GPA", value: selectedStudentResults.gpa },
                      { label: "CGPA", value: selectedStudentResults.cgpa },
                      { label: "Backlogs", value: selectedStudentResults.backlogs }
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", marginTop: "4px" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Students;
