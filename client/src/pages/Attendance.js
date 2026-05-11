import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Attendance = () => {
  const [courseId, setCourseId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [markedStatus, setMarkedStatus] = useState({});

  const loadRoster = async () => {
    setLoading(true);
    // Always fetch full roster to keep the course selection menu populated
    try {
      const res = await api.get(`/attendance?attendance_date=${attendanceDate}`);
      setRoster(res.data);
      
      // Sync markedStatus with existing data from DB
      const existingStatus = {};
      res.data.forEach(item => {
        if (item.current_status) {
          existingStatus[`${item.student_id}-${item.course_id}`] = item.current_status;
        }
      });
      setMarkedStatus(existingStatus);
      
      setMessage({ type: "", text: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to load roster" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoster(); }, [attendanceDate]);

  const mark = async (studentId, selectedCourseId, status) => {
    try {
      await api.post("/attendance", {
        student_id: Number(studentId),
        course_id: Number(selectedCourseId),
        attendance_date: attendanceDate,
        status
      });
      setMarkedStatus(prev => ({ ...prev, [`${studentId}-${selectedCourseId}`]: status }));
      setMessage({ type: "success", text: `Marked ${status} for student` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save attendance" });
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFaculty = user.role === "faculty";

  const courseOptions = useMemo(() => {
    let baseRoster = roster;
    if (isFaculty) {
      baseRoster = roster.filter(item => Number(item.faculty_id) === Number(user.faculty_id));
    }
    
    return Array.from(new Set(baseRoster.map((item) => item.course_id))).map((id) => {
      const row = baseRoster.find((item) => item.course_id === id);
      return { id, label: `${row.course_code} - ${row.course_title}` };
    });
  }, [roster, isFaculty, user.faculty_id]);

  const filteredRoster = courseId ? roster.filter((item) => String(item.course_id) === String(courseId)) : roster;

  const presentCount = Object.values(markedStatus).filter(v => v === "Present").length;
  const absentCount = Object.values(markedStatus).filter(v => v === "Absent").length;
  const totalMarked = presentCount + absentCount;

  if (loading && roster.length === 0) return <Loader />;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          Academic Operations Dashboard
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Attendance Management
        </h1>
      </div>

      <div className="grid-two" style={{ alignItems: "flex-start" }}>
        {/* ── LEFT PANEL: Controls ── */}
        <section className="left-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "24px", paddingBottom: "18px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{ width: "32px", height: "32px", background: "#eff6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  📅
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>Session Parameters</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "42px" }}>Configure course and date for attendance recording</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Subject Allocation
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="">All Assigned Courses</option>
                  {courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>{course.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                  Session Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={loadRoster}
                style={{ width: "100%", padding: "11px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
              >
                ↻ Refresh Registry
              </button>
            </div>

            {message.text && (
              <div style={{
                marginTop: "16px", padding: "11px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                color: message.type === "success" ? "#16a34a" : "#dc2626",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`
              }}>
                {message.text}
              </div>
            )}
          </div>

          {/* Session Summary Chart */}
          <div className="glass-card" style={{ marginTop: "20px", padding: "28px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", marginBottom: "20px" }}>
              Session Summary
            </h3>

            {totalMarked > 0 ? (
              <>
                <div style={{ height: "180px" }}>
                  <Doughnut
                    data={{
                      labels: ["Present", "Absent"],
                      datasets: [{ data: [presentCount, absentCount], backgroundColor: ["#2563eb", "#e2e8f0"], borderWidth: 0, hoverOffset: 6 }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { size: 12 } } } } }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>PRESENT</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>{presentCount}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>ABSENT</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#94a3b8" }}>{absentCount}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
                <p style={{ fontSize: "13px" }}>Mark attendance to see summary</p>
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANEL: Student Roster ── */}
        <section className="right-panel">
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Student Roster</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  {filteredRoster.length} student{filteredRoster.length !== 1 ? "s" : ""} •{" "}
                  <span style={{ color: "#2563eb", fontWeight: "600" }}>{attendanceDate}</span>
                </p>
              </div>
            </div>

            {filteredRoster.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
                <p style={{ fontWeight: "600" }}>No students found for this selection</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredRoster.filter(s => s.student_id).map((student) => {
                  const key = `${student.student_id}-${student.course_id}`;
                  const status = markedStatus[key];
                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 18px",
                        border: status === "Present" ? "1.5px solid #bbf7d0" : status === "Absent" ? "1.5px solid #fecaca" : "1.5px solid #f1f5f9",
                        borderRadius: "12px",
                        background: status === "Present" ? "#f0fdf4" : status === "Absent" ? "#fef2f2" : "#fff",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "10px",
                          background: "#eff6ff", color: "#2563eb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "800", fontSize: "15px", flexShrink: 0
                        }}>
                          {student.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{student.full_name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            <span style={{ fontWeight: "600", color: "var(--primary)" }}>{student.roll_no}</span>
                            {" · "}{student.course_code}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {status && (
                          <span style={{
                            fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px",
                            background: status === "Present" ? "#f0fdf4" : "#fef2f2",
                            color: status === "Present" ? "#16a34a" : "#dc2626"
                          }}>{status}</span>
                        )}
                        <button
                          onClick={() => mark(student.student_id, student.course_id, "Present")}
                          style={{ padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => mark(student.student_id, student.course_id, "Absent")}
                          style={{ padding: "7px 16px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Attendance;
