import React, { useEffect, useState } from "react";
import api from "../services/api";

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "Password@123",
    faculty_code: "",
    full_name: "",
    department: "Computer Science"
  });
  const [assignment, setAssignment] = useState({ faculty_id: "", course_id: "" });
  const [filterDept, setFilterDept] = useState("All");
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const departments = [
    "All",
    "Artificial Intelligence and Data Science",
    "Computer Science",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering"
  ];

  const fetchNextCode = async (dept) => {
    if (!dept || dept === "All") return;
    try {
      const res = await api.get(`/faculty/next-code/${encodeURIComponent(dept)}`);
      const nextCode = res.data.nextCode;
      setForm(prev => ({ 
        ...prev, 
        department: dept, 
        faculty_code: nextCode,
        email: `${nextCode.toLowerCase()}@college.com`
      }));
    } catch (err) {
      console.error("Failed to fetch next faculty code", err);
    }
  };

  const load = () => {
    api.get("/faculty").then((r) => setFaculty(r.data)).catch(() => {});
    api.get("/courses").then((r) => setCourses(r.data)).catch(() => {});
  };

  useEffect(() => { 
    load(); 
    fetchNextCode("Computer Science");
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/faculty", form);
      setForm({ ...form, email: "", faculty_code: "", full_name: "" });
      setMessage("✓ Faculty member provisioned successfully.");
      setMsgType("success");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save record.");
      setMsgType("error");
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;
    try {
      const res = await api.get(`/faculty/search/${searchCode.trim().toUpperCase()}`);
      setSearchResult(res.data);
      setMessage("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Search failed.";
      setMessage(errorMsg);
      setMsgType("error");
      setSearchResult(null);
    }
  };

  const assign = async (e) => {
    e.preventDefault();
    try {
      await api.post("/faculty/assign", assignment);
      setMessage("✓ Course assignment successful.");
      setMsgType("success");
      setAssignment({ faculty_id: "", course_id: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Assignment failed.");
      setMsgType("error");
    }
  };

  const filteredFaculty = faculty.filter(f => filterDept === "All" || f.department === filterDept);

  return (
    <div className="faculty-page">
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          Human Resources & Instruction
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Faculty Directory
        </h1>
      </div>

      <div className="grid-two" style={{ alignItems: "flex-start" }}>
        {/* Left Panel: Provisioning & Assignment */}
        <section className="left-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{ width: "32px", height: "32px", background: "#fff7ed", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  👨‍🏫
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>Faculty Provisioning</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "42px" }}>Register new instructional staff members</p>
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
                  Full Name
                </label>
                <input
                  placeholder="Enter full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@college.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Departmental Assignment
                </label>
                <select
                  required
                  value={form.department}
                  onChange={(e) => fetchNextCode(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                >
                  {departments.filter(d => d !== "All").map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label" style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  System Generated Code
                </label>
                <input
                  value={form.faculty_code}
                  readOnly
                  required
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", background: "#f8fafc", color: "#475569", fontWeight: "600", cursor: "default", boxSizing: "border-box" }}
                />
              </div>
              <button
                type="submit"
                style={{ width: "100%", padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}
              >
                ＋ Provision Faculty Member
              </button>
            </form>
          </div>

          {/* Assignment Form */}
          <div className="glass-card" style={{ padding: "28px", marginTop: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>Instructional Allocation</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Link faculty members to catalog courses</p>
            </div>
            <form onSubmit={assign} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <select
                value={assignment.faculty_id}
                onChange={(e) => setAssignment({ ...assignment, faculty_id: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
              >
                <option value="">— Select Instructor —</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.faculty_code})</option>
                ))}
              </select>
              <select
                value={assignment.course_id}
                onChange={(e) => setAssignment({ ...assignment, course_id: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" }}
              >
                <option value="">— Select Subject —</option>
                {(() => {
                  const selectedFaculty = faculty.find(f => String(f.id) === String(assignment.faculty_id));
                  const availableCourses = selectedFaculty 
                    ? courses.filter(c => c.department === selectedFaculty.department)
                    : courses;
                  
                  return availableCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ));
                })()}
              </select>
              <button
                type="submit"
                style={{ width: "100%", padding: "11px", background: "#f8fafc", color: "var(--primary)", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
              >
                Assign Subject
              </button>
            </form>
          </div>
        </section>

        {/* Right Panel: Faculty Directory */}
        <section className="right-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "32px", 
              paddingBottom: "20px", 
              borderBottom: "1.5px solid #f8fafc" 
            }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, lineHeight: "1.2" }}>Faculty Registry</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0", fontWeight: "500" }}>{filteredFaculty.length} Instructors cataloged</p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <form onSubmit={handleSearch}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    background: "#f8fafc", 
                    border: "1.5px solid #f1f5f9", 
                    borderRadius: "12px", 
                    width: "260px", 
                    height: "42px", 
                    padding: "0 14px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#f1f5f9"}
                  >
                    <span style={{ fontSize: "16px", marginRight: "10px", display: "flex", alignItems: "center" }}>🔍</span>
                    <input
                      placeholder="Search faculty code..."
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      style={{ 
                        border: "none", 
                        background: "transparent", 
                        fontSize: "14px", 
                        outline: "none", 
                        flex: 1, 
                        color: "var(--primary)",
                        fontWeight: "500"
                      }}
                    />
                  </div>
                </form>

                <div style={{ width: "1.5px", height: "24px", background: "#f1f5f9" }}></div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filter by:</span>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    style={{ 
                      padding: "0 36px 0 14px", 
                      height: "42px",
                      border: "1.5px solid #f1f5f9", 
                      borderRadius: "12px", 
                      fontSize: "13px", 
                      outline: "none", 
                      background: "#f8fafc", 
                      fontWeight: "700", 
                      color: "var(--primary)",
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "14px",
                      minWidth: "200px"
                    }}
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", paddingRight: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredFaculty.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: "16px 20px", border: "1.5px solid #f1f5f9", borderRadius: "14px", background: "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "42px", height: "42px", background: "#f8fafc", color: "var(--primary)", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px"
                      }}>
                        {f.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{f.full_name}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                            {f.department}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{f.faculty_code}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{f.email}</div>
                    </div>
                  </div>
                ))}
                {filteredFaculty.length === 0 && (
                  <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>👨‍🏫</div>
                    <p style={{ fontWeight: "600" }}>No faculty records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Search Result Modal */}
      {searchResult && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "90%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative" }}>
            <button 
              onClick={() => setSearchResult(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "800", color: "#64748b" }}
            >
              ✕
            </button>
            
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>{searchResult.full_name}</h2>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>{searchResult.faculty_code} • {searchResult.department}</p>
              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", background: "#f8fafc", padding: "4px 10px", borderRadius: "6px" }}>
                   {searchResult.courses.length} Courses Assigned
                </span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", background: "#f0fdf4", padding: "4px 10px", borderRadius: "6px" }}>
                   {searchResult.students.length} Total Students
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
              <div style={{ borderRight: "1.5px solid #f1f5f9", paddingRight: "24px" }}>
                <h4 style={{ fontSize: "12px", fontWeight: "700", marginBottom: "16px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Handling Courses</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {searchResult.courses.map(c => (
                    <div key={c.id} style={{ padding: "14px", border: "1.5px solid #f1f5f9", borderRadius: "12px", background: "#f8fafc" }}>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--primary)" }}>{c.title}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", fontWeight: "600" }}>{c.code}</div>
                    </div>
                  ))}
                  {searchResult.courses.length === 0 && <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px" }}>No courses assigned.</p>}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "700", marginBottom: "16px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Student Registry</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {searchResult.students.map((s, idx) => (
                    <div key={idx} style={{ padding: "14px", border: "1.5px solid #f1f5f9", borderRadius: "12px", background: "#fff" }}>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{s.full_name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.roll_no}</div>
                      <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: "700", marginTop: "4px", background: "#f1f5f9", display: "inline-block", padding: "2px 6px", borderRadius: "4px" }}>
                        {s.course_code}
                      </div>
                    </div>
                  ))}
                  {searchResult.students.length === 0 && (
                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No students enrolled in these courses.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
