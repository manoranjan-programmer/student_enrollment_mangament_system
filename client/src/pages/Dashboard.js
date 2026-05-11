import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import api from "../services/api";
import Loader from "../components/Loader";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const centerTextPlugin = {
  id: "centerText",
  afterDatasetsDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const { x, y } = meta.data[0];
    const text = pluginOptions?.text || "";
    const subText = pluginOptions?.subText || "";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 28px Inter";
    ctx.fillText(text, x, y - 4);
    ctx.fillStyle = "#64748b";
    ctx.font = "500 12px Inter";
    ctx.fillText(subText, x, y + 20);
    ctx.restore();
  }
};

const Dashboard = () => {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    api.get("/dashboard")
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load dashboard");
      });
  }, []);

  if (error) return <div className="glass-card" style={{ color: "#ef4444", padding: "20px", textAlign: "center" }}>{error}</div>;
  if (!data) return <Loader />;

  const renderKPIs = (kpis) => (
    <section className="kpi-grid">
      {kpis.map((kpi, idx) => (
        <article className="glass-card kpi-card" key={idx} style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between",
          minHeight: "130px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ zIndex: 1 }}>
            <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              {kpi.label}
            </h3>
            <p style={{ color: "var(--primary)", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.02em" }}>
              {kpi.value}
            </p>
          </div>
          {kpi.trend && (
            <div style={{ fontSize: "12px", color: kpi.trend > 0 ? "#10b981" : "#ef4444", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              {kpi.trend > 0 ? "↑" : "↓"} {Math.abs(kpi.trend)}% vs last term
            </div>
          )}
          <div style={{ 
            position: "absolute", 
            right: "-10px", 
            bottom: "-10px", 
            fontSize: "64px", 
            opacity: 0.03, 
            transform: "rotate(-15deg)" 
          }}>
            {kpi.icon || "📈"}
          </div>
        </article>
      ))}
    </section>
  );

  if (user.role === "student") {
    const student = data.student || {};
    const summary = data.summary || {};
    const enrolledCourses = data.enrolled_courses || [];

    const kpis = [
      { label: "Profile Identity", value: student.full_name || "N/A", icon: "👤" },
      { label: "Enrollment ID", value: student.roll_no || "N/A", icon: "🆔" },
      { label: "Active Semester", value: `Term ${student.semester || "0"}`, icon: "📅" },
      { label: "Course Load", value: summary.enrolled_courses || 0, icon: "📚", trend: 12 },
      { label: "Aggregate Score", value: parseFloat(summary.average_marks || 0).toFixed(1), icon: "📊", trend: 5.4 },
      { label: "Completion Rate", value: `${Math.round((summary.passed_courses / (summary.enrolled_courses || 1)) * 100)}%`, icon: "✅" }
    ];

    return (
      <div className="dashboard-page" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {renderKPIs(kpis)}
        <section className="glass-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.01em" }}>
                Academic Performance Registry
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Detailed breakdown of current semester enrollments and outcomes.</p>
            </div>
            <button className="btn" style={{ fontSize: "12px" }}>Export Transcript</button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
            {enrolledCourses.map((course) => (
              <div className="list-item" key={course.course_id} style={{ marginBottom: "0", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase" }}>{course.code}</span>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: "var(--primary)" }}>{course.title}</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>Credits: {course.credits || 3.0}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>STATUS</div>
                    <span style={{ 
                      display: "inline-block", 
                      fontSize: "12px", 
                      color: course.result_status === "Pass" ? "#10b981" : "#2563eb", 
                      fontWeight: "700", 
                      marginTop: "6px",
                      padding: "4px 10px",
                      background: course.result_status === "Pass" ? "#f0fdf4" : "#eff6ff",
                      borderRadius: "6px"
                    }}>
                      {course.result_status || "IN PROGRESS"}
                    </span>
                    {course.grade && (
                      <div style={{ marginTop: "12px", fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>{course.grade}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {enrolledCourses.length === 0 && <p style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontStyle: "italic" }}>No active academic records detected.</p>}
        </section>
      </div>
    );
  }

  if (user.role === "faculty") {
    const faculty = data.faculty || {};
    const summary = data.summary || {};
    const courses = data.courses || [];

    const kpis = [
      { label: "Faculty Identity", value: faculty.full_name || "N/A", icon: "👨‍🏫" },
      { label: "Instructional ID", value: faculty.faculty_code || "N/A", icon: "🆔" },
      { label: "Departmental Unit", value: faculty.department || "N/A", icon: "🏛️" },
      { label: "Subject Portfolio", value: summary.subjects_handled || 0, icon: "📚" },
      { label: "Student Reach", value: summary.total_students || 0, icon: "👥", trend: 8 }
    ];

    return (
      <div className="dashboard-page" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {renderKPIs(kpis)}
        <section className="glass-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.01em" }}>
                Instructional Load Overview
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Current semester course assignments and enrollment metrics.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "24px" }}>
            {courses.map((course) => (
              <div className="list-item" key={course.course_id} style={{ marginBottom: "0", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase" }}>{course.code}</span>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: "var(--primary)" }}>{course.title}</h4>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "4px" }}>ENROLLMENT</div>
                    <span style={{ fontSize: "14px", background: "var(--primary)", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontWeight: "700" }}>
                      {course.enrolled_students}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {courses.length === 0 && <p style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontStyle: "italic" }}>No instructional subjects currently assigned.</p>}
        </section>

        {/* Faculty Attendance Summary */}
        {data.attendance_breakdown && data.attendance_breakdown.length > 0 && (
          <section className="glass-card chart-card" style={{ padding: "32px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Instructional Presence</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Aggregate attendance summary for your assigned curriculum.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "center" }}>
              <div style={{ height: "220px" }}>
                <Doughnut
                  data={{
                    labels: ["Present", "Absent"],
                    datasets: [{
                      data: [
                        data.attendance_breakdown.find(i => i.status === "Present")?.count || 0,
                        data.attendance_breakdown.find(i => i.status === "Absent")?.count || 0
                      ],
                      backgroundColor: ["#2563eb", "#f1f5f9"],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%",
                    plugins: {
                      legend: { position: "bottom", labels: { font: { size: 11, weight: '600' } } }
                    }
                  }}
                />
              </div>
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Present Count</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb" }}>
                    {data.attendance_breakdown.find(i => i.status === "Present")?.count || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Absent Count</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#94a3b8" }}>
                    {data.attendance_breakdown.find(i => i.status === "Absent")?.count || 0}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  // Admin Dashboard
  const present = data.attendance_breakdown.find((i) => i.status === "Present")?.count || 0;
  const absent = data.attendance_breakdown.find((i) => i.status === "Absent")?.count || 0;
  const totalAttendance = present + absent;
  const presentPercentage = totalAttendance ? Math.round((present / totalAttendance) * 100) : 0;

  const kpis = [
    { label: "Top Performer", value: data.topper?.student_name || "N/A", icon: "🏆" },
    { label: "Global Avg Score", value: parseFloat(data.average_marks || 0).toFixed(1), icon: "📈", trend: 2.1 },
    { label: "Success Matrix", value: `${data.pass_percentage}%`, icon: "🎯", trend: -1.2 },
    { label: "Total Students", value: data.total_students || 0, icon: "👥" }
  ];

  return (
    <div className="dashboard-page" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {renderKPIs(kpis)}
      
      <div className="grid-two" style={{ gridColumn: "1 / -1", gap: "32px" }}>
        <section className="glass-card chart-card" style={{ gridColumn: "span 1", padding: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Institutional Presence</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Real-time aggregate attendance metrics across all departments.</p>
          </div>
          <div className="attendance-chart-wrap" style={{ height: "260px" }}>
            <Doughnut
              data={{
                labels: ["Present", "Absent"],
                datasets: [{
                  data: [present, absent],
                  backgroundColor: ["#2563eb", "#f1f5f9"],
                  borderWidth: 0,
                  hoverOffset: 10
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "82%",
                plugins: {
                  legend: { display: false },
                  centerText: { text: `${presentPercentage}%`, subText: "Overall Presence" }
                }
              }}
              plugins={[centerTextPlugin]}
            />
          </div>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "32px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>PRESENT</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb" }}>{present}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>ABSENT</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#94a3b8" }}>{absent}</div>
            </div>
          </div>
        </section>

        <section className="glass-card chart-card" style={{ gridColumn: "span 1", padding: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Departmental Performance</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Comparative analysis of average scores by subject area.</p>
          </div>
          <div className="chart-body" style={{ height: "260px" }}>
            <Bar
              data={{
                labels: data.marks_trend.map((m) => m.subject.split(' ')[0]), // Short labels
                datasets: [{ 
                  label: "Mean Score", 
                  data: data.marks_trend.map((m) => m.average_marks), 
                  backgroundColor: "#2563eb",
                  borderRadius: 8,
                  barThickness: 32
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9", drawBorder: false }, ticks: { font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' } } }
                }
              }}
            />
          </div>
        </section>

        <section className="glass-card chart-card" style={{ gridColumn: "1 / -1", padding: "32px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Global Performance Trend</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Longitudinal analysis of academic metrics across the curriculum.</p>
          </div>
          <div className="chart-body" style={{ height: "320px" }}>
            <Line
              data={{
                labels: data.marks_trend.map((m) => m.subject),
                datasets: [
                  {
                    label: "Performance Index",
                    data: data.marks_trend.map((m) => m.average_marks),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    fill: true,
                    tension: 0.45,
                    pointRadius: 6,
                    pointBackgroundColor: "#ffffff",
                    pointBorderWidth: 3,
                    pointBorderColor: "#2563eb",
                    pointHoverRadius: 8
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0f172a',
                    padding: 12,
                    titleFont: { size: 14, weight: '700' },
                    bodyFont: { size: 13 },
                    cornerRadius: 8
                  }
                },
                scales: { 
                  y: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9", borderDash: [4, 4] }, ticks: { font: { size: 11 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' } } }
                }
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
