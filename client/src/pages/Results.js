import React, { useEffect, useState } from "react";
import api from "../services/api";
import Toast from "../components/Toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE = {
  header: (label, title) => (
    <div style={{ marginBottom: "28px" }}>
      <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
        {label}
      </p>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
        {title}
      </h1>
    </div>
  ),
  pill: (text, pass) => (
    <span style={{
      fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px",
      background: pass ? "#f0fdf4" : "#fef2f2",
      color: pass ? "#16a34a" : "#dc2626"
    }}>{text}</span>
  ),
  th: (label) => (
    <th style={{ padding: "11px 16px", fontSize: "11px", fontWeight: "700", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </th>
  ),
};

const Results = ({ role }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const load = () => {
    const q = role === "student" ? `?studentId=${user.student_id}` : "";
    api.get(`/results${q}`)
      .then((r) => setResults(r.data))
      .catch((err) => setToast(err.response?.data?.message || "Failed to load results"));
  };

  const loadCourses = () => {
    api.get("/courses")
      .then((r) => setCourses(r.data))
      .catch((err) => setToast(err.response?.data?.message || "Failed to load courses"));
  };

  const loadEnrolledStudents = (courseId) => {
    if (!courseId) { setEnrolledStudents([]); return; }
    api.get(`/courses/${courseId}/enrolled-students`)
      .then((r) => setEnrolledStudents(r.data))
      .catch((err) => setToast(err.response?.data?.message || "Failed to load enrolled students"));
  };

  useEffect(() => { load(); loadCourses(); }, []);
  useEffect(() => { loadEnrolledStudents(selectedCourse); }, [selectedCourse]);

  const uploadMarks = async (studentId, courseId, marks, internalMarks) => {
    try {
      await api.post("/marks", {
        student_id: Number(studentId), course_id: Number(courseId),
        marks: Number(marks), internal_marks: Number(internalMarks || 0)
      });
      setToast("Result updated successfully");
      load(); loadEnrolledStudents(selectedCourse);
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to save result");
    }
  };

  const handlePublishClick = (student) => {
    setModal({
      studentId: student.id,
      name: student.full_name,
      marks: student.marks || "",
      internalMarks: student.internal_marks || "0"
    });
  };

  const saveModal = () => {
    uploadMarks(modal.studentId, selectedCourse, modal.marks, modal.internalMarks);
    setModal(null);
  };

  const downloadPDF = (studentResult) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("EduInsight Intelligence", 20, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Official Academic Transcript & Performance Record", 20, 28);
    doc.setTextColor(30, 41, 59); doc.setFontSize(12);
    doc.text(`Student Name: ${studentResult.student_name}`, 20, 55);
    doc.text(`Issuance Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 55, { align: "right" });
    autoTable(doc, {
      startY: 75,
      head: [["Code", "Course Title", "Marks", "Grade", "Status"]],
      body: studentResult.records.map(rec => [rec.course_code, rec.course_title || "N/A", rec.marks, rec.grade, rec.result_status]),
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    const finalY = (doc.lastAutoTable?.finalY || 100) + 20;
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Performance Summary", 20, finalY);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`GPA: ${studentResult.gpa}`, 20, finalY + 10);
    doc.text(`CGPA: ${studentResult.cgpa}`, 20, finalY + 18);
    doc.text(`Backlogs: ${studentResult.backlogs}`, 20, finalY + 26);
    doc.line(pageWidth - 80, finalY + 40, pageWidth - 20, finalY + 40);
    doc.setFontSize(10);
    doc.text("Registrar (Evaluation)", pageWidth - 50, finalY + 46, { align: "center" });
    doc.save(`${studentResult.student_name}_GradeSheet.pdf`);
  };

  const handleFinalPublish = async () => {
    if (!selectedCourse) return;
    setConfirmModal(true);
  };

  const executePublish = async () => {
    try {
      await api.post("/publish-results", { course_id: Number(selectedCourse) });
      setToast("Academic records finalized and published to official transcripts.");
      setConfirmModal(false);
      load(); loadEnrolledStudents(selectedCourse);
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to publish results");
    }
  };

  const facultyCourses = courses.filter((c) => {
    if (role === "faculty") return Number(c.faculty_id) === Number(user.faculty_id);
    return true;
  });

  /* ─────────── FACULTY / ADMIN VIEW ─────────── */
  if (role === "faculty" || role === "admin") {
    return (
      <div>
        {PAGE.header("Academic Operations", "Result Management")}
        <div className="glass-card" style={{ padding: "28px" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Result Publication Terminal</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Select a course to manage student marks and publish results</p>
            </div>
            {selectedCourse && (
              <button
                onClick={handleFinalPublish}
                style={{ padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              >
                ✓ Finalize & Publish to Transcript
              </button>
            )}
          </div>

          {/* Course Selector */}
          <div style={{ maxWidth: "420px", marginBottom: "32px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              Instructional Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" }}
            >
              <option value="">— Select Curriculum Item —</option>
              {facultyCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>

          {/* Enrolled Students Table */}
          {selectedCourse && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#475569" }}>
                  Verified Enrollment List
                  <span style={{ marginLeft: "10px", fontSize: "12px", background: "#eff6ff", color: "#2563eb", padding: "2px 10px", borderRadius: "6px", fontWeight: "700" }}>
                    {enrolledStudents.length} students
                  </span>
                </h4>
              </div>
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "var(--primary)", color: "#fff" }}>
                      {["Roll No", "Student Name", "Marks", "Status", "Action"].map(h => PAGE.th(h))}
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((s, i) => (
                      <tr key={s.id} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 16px", fontWeight: "700", color: "var(--primary)" }}>{s.roll_no}</td>
                        <td style={{ padding: "13px 16px", fontWeight: "500" }}>{s.full_name}</td>
                        <td style={{ padding: "13px 16px", fontWeight: "700" }}>{s.marks ?? <span style={{ color: "#94a3b8" }}>—</span>}</td>
                        <td style={{ padding: "13px 16px" }}>{PAGE.pill(s.result_status || "Pending", s.result_status === "Pass")}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <button
                            onClick={() => handlePublishClick(s)}
                            style={{ padding: "6px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "var(--primary)" }}
                          >
                            Edit Marks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {enrolledStudents.length === 0 && (
                  <p style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No active enrollments for this course.</p>
                )}
              </div>
            </>
          )}

          {!selectedCourse && (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
              <p style={{ fontWeight: "600" }}>Select a course above to manage results</p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {modal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div className="glass-card" style={{ width: "min(400px, 90%)", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)", marginBottom: "8px" }}>Update Performance</h3>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>Modifying records for <strong style={{ color: "var(--primary)" }}>{modal.name}</strong></p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>Final Theory Marks</label>
                  <input 
                    type="number"
                    value={modal.marks} 
                    onChange={e => setModal({...modal, marks: e.target.value})}
                    style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", boxSizing: "border-box", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>Internal Assessment</label>
                  <input 
                    type="number"
                    value={modal.internalMarks} 
                    onChange={e => setModal({...modal, internalMarks: e.target.value})}
                    style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", boxSizing: "border-box", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button 
                  onClick={() => setModal(null)}
                  style={{ flex: 1, padding: "12px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#64748b", transition: "all 0.2s" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveModal}
                  style={{ flex: 1, padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finalize Confirmation Modal */}
        {confirmModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div className="glass-card" style={{ width: "min(400px, 90%)", padding: "32px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📢</div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)", marginBottom: "12px" }}>Finalize Publication?</h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "32px" }}>
                This action will push all marks for this course to the official student transcripts. This action is irreversible.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => setConfirmModal(false)}
                  style={{ flex: 1, padding: "12px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#64748b" }}
                >
                  Go Back
                </button>
                <button 
                  onClick={executePublish}
                  style={{ flex: 1, padding: "12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Yes, Publish
                </button>
              </div>
            </div>
          </div>
        )}

        <Toast message={toast} onClose={() => setToast("")} />
      </div>
    );
  }

  /* ─────────── STUDENT VIEW ─────────── */
  return (
    <div>
      {PAGE.header("Student Portal", "Academic Transcript")}
      {results.length === 0 ? (
        <div className="glass-card" style={{ padding: "80px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
          <p style={{ fontWeight: "600", color: "#475569" }}>No official results published yet</p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Results will appear here once published by your instructor</p>
        </div>
      ) : (
        results.map((r) => (
          <div key={r.student_id} className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
            {/* Student Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "22px" }}>
                  {r.student_name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>{r.student_name}</h4>
                  <p style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Consolidated Academic Record</p>
                </div>
              </div>
              <button
                onClick={() => downloadPDF(r)}
                style={{ padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              >
                ↓ Download PDF
              </button>
            </div>

            {/* Results Table */}
            <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--primary)", color: "#fff" }}>
                    {["Course Code", "Credits", "Marks", "Grade", "Result"].map(h => PAGE.th(h))}
                  </tr>
                </thead>
                <tbody>
                  {r.records.map((rec, i) => (
                    <tr key={`${r.student_id}-${rec.course_id}`} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "13px 16px", fontWeight: "700", color: "var(--primary)" }}>{rec.course_code}</td>
                      <td style={{ padding: "13px 16px", color: "#64748b" }}>{rec.credits || 4}</td>
                      <td style={{ padding: "13px 16px", fontWeight: "700" }}>{rec.marks}</td>
                      <td style={{ padding: "13px 16px", fontWeight: "800", fontSize: "16px" }}>{rec.grade}</td>
                      <td style={{ padding: "13px 16px" }}>{PAGE.pill(rec.result_status, rec.result_status === "Pass")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {[{ label: "GPA", value: r.gpa }, { label: "CGPA", value: r.cgpa }, { label: "Backlogs", value: r.backlogs }].map(item => (
                <div key={item.label} style={{ flex: 1, textAlign: "center", background: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary)", marginTop: "4px" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
};

export default Results;
