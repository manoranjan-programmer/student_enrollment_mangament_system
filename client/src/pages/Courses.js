import React, { useEffect, useState } from "react";
import api from "../services/api";

const Courses = ({ role }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = role === "student";

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
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [form, setForm] = useState({
    code: "",
    title: "",
    credits: 4,
    faculty_id: 1,
    prerequisite_course_id: "",
    is_advanced: false,
    department: "Computer Science",
    semester: 4
  });
  const [filterDept, setFilterDept] = useState(
    role === "faculty" ? (user.department || "All") : "All"
  );

  const departments = [
    "All",
    "Artificial Intelligence and Data Science",
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering"
  ];

  const fetchNextCode = async (dept, sem) => {
    if (!dept || !sem) return;
    try {
      const res = await api.get(`/courses/next-code/${encodeURIComponent(dept)}/${sem}`);
      setForm(prev => ({ ...prev, department: dept, semester: sem, code: res.data.nextCode }));
    } catch (err) {
      console.error("Failed to fetch next course code", err);
    }
  };

  const load = () => api.get("/courses")
    .then((r) => {
      let data = r.data;
      if (isStudent) {
        if (studentDept) {
          data = data.filter(c => c.department === studentDept);
        } else {
          data = [];
        }
      }
      setCourses(data);
      setMessage("");
    })
    .catch((err) => { setMessage(err.response?.data?.message || "Failed to load courses"); setMsgType("error"); });

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", {
        ...form,
        prerequisite_course_id: form.prerequisite_course_id || null
      });
      setForm({ ...form, code: "", title: "" });
      setMessage("✓ Course catalog updated.");
      setMsgType("success");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save course");
      setMsgType("error");
    }
  };

  const filteredCourses = courses.filter(c => {
    if (isStudent || role === "faculty") {
      const dept = isStudent ? studentDept : user.department;
      return c.department === dept;
    }
    return filterDept === "All" || c.department === filterDept;
  });

  return (
    <div className="courses-page">
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          Curriculum & Syllabus
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Academic Catalog
        </h1>
      </div>

      <div className={role === "admin" ? "grid-two" : ""} style={{ alignItems: "flex-start" }}>
        {role === "admin" && (
          <section className="left-panel">
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <div style={{ width: "32px", height: "32px", background: "#fdf4ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    📚
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>Catalog Management</h3>
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "42px" }}>Define new academic offerings and credit values</p>
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

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Official Title
                  </label>
                  <input
                    placeholder="Enter course title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Departmental Unit
                  </label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) => fetchNextCode(e.target.value, form.semester)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                  >
                    {departments.filter(d => d !== "All").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                      Semester
                    </label>
                    <select
                      required
                      value={form.semester}
                      onChange={(e) => fetchNextCode(form.department, e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                      Credits
                    </label>
                    <input
                      type="number"
                      value={form.credits}
                      onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                      required
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div className="field-group" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    Generated Course Code
                  </label>
                  <input
                    value={form.code}
                    readOnly
                    required
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", background: "#f8fafc", color: "#475569", fontWeight: "600", cursor: "default", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                  <input
                    type="checkbox"
                    id="is_advanced"
                    checked={form.is_advanced}
                    onChange={(e) => setForm({ ...form, is_advanced: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="is_advanced" style={{ fontSize: "14px", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
                    Mark as Advanced Level
                  </label>
                </div>

                <button
                  type="submit"
                  style={{ width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}
                >
                  ＋ Create Catalog Entry
                </button>
              </form>
            </div>
          </section>
        )}

        <section className="right-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Available Curriculum</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} currently offered
                </p>
              </div>
              {role === "admin" && (
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  style={{ padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", fontWeight: "500", minWidth: "160px" }}
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: role === "admin" ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "20px",
                      border: "1.5px solid #f1f5f9",
                      borderRadius: "16px",
                      background: "#fff",
                      transition: "all 0.2s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#f1f5f9";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: "6px" }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
                        {c.credits} CREDITS
                      </span>
                    </div>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", lineHeight: "1.4", marginBottom: "12px" }}>
                      {c.title}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                        {c.department}
                      </span>
                      {c.is_advanced && (
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", background: "#f5f3ff", padding: "2px 8px", borderRadius: "4px" }}>
                          ADVANCED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filteredCourses.length === 0 && (
                <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📑</div>
                  <p style={{ fontWeight: "600" }}>No curriculum records found</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Courses;
