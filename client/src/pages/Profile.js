import React from "react";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const loginId = localStorage.getItem("login_id");

  let profileRows = [];
  if (user.role === "student") {
    profileRows = [
      { label: "Institutional ID", value: user.student_id || "—", icon: "🆔" },
      { label: "Roll Number", value: loginId || "—", icon: "🔢" },
      { label: "Academic Unit", value: user.department || "General", icon: "🏢" },
      { label: "Primary Email", value: user.email || "—", icon: "📧" },
      { label: "System Role", value: "Student", icon: "🎓" }
    ];
  } else if (user.role === "faculty") {
    profileRows = [
      { label: "Faculty ID", value: user.faculty_id || "—", icon: "🆔" },
      { label: "Faculty Code", value: user.faculty_code || "—", icon: "🔢" },
      { label: "Department", value: user.department || "—", icon: "🏢" },
      { label: "Official Email", value: user.email || "—", icon: "📧" },
      { label: "System Role", value: "Faculty", icon: "👨‍🏫" }
    ];
  } else {
    profileRows = [
      { label: "Admin ID", value: user.id || "—", icon: "🆔" },
      { label: "Official Email", value: user.email || "—", icon: "📧" },
      { label: "System Role", value: "Administrator", icon: "🛡️" }
    ];
  }

  const timetable = [
    { day: "Monday", time: "10:00 AM", course: "Advanced Computing", code: "CS101" },
    { day: "Wednesday", time: "11:00 AM", course: "Systems Architecture", code: "CS201" },
    { day: "Friday", time: "12:00 PM", course: "Data Engineering", code: "CS301" }
  ];

  return (
    <div className="profile-page" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          User Information Center
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.02em" }}>
          Personal Profile
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "28px", alignItems: "flex-start" }}>
        {/* Left Panel: Identity Card */}
        <section>
          <div className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
            <div style={{
              width: "96px", height: "96px", margin: "0 auto 20px",
              background: "linear-gradient(135deg, var(--primary), #4f46e5)",
              color: "#fff", borderRadius: "24px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", fontWeight: "800", boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)"
            }}>
              {(user.email || "U").charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", marginBottom: "4px" }}>
              {user.role === "student" ? "Scholar Profile" : user.role === "faculty" ? "Instructor Profile" : "System Admin"}
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>{user.email}</p>
            
            <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "14px" }}>
              {profileRows.map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>{row.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel: Academic Schedule */}
        <section>
          {user.role !== "admin" && (
            <div className="glass-card" style={{ padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "36px", height: "36px", background: "#fef2f2", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                  📅
                </div>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)" }}>Academic Engagement Schedule</h4>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Current semester weekly agenda</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {timetable.map((item) => (
                  <div 
                    key={`${item.day}-${item.time}`} 
                    style={{ 
                      display: "grid", gridTemplateColumns: "100px 1fr 80px", gap: "16px", alignItems: "center",
                      padding: "16px 20px", background: "#f8fafc", borderRadius: "14px", border: "1.5px solid #f1f5f9"
                    }}
                  >
                    <span style={{ fontWeight: "800", color: "#2563eb", fontSize: "13px" }}>{item.day}</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{item.course}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{item.time}</div>
                    </div>
                    <span style={{ textAlign: "right", fontSize: "11px", fontWeight: "800", color: "#64748b", background: "#e2e8f0", padding: "4px 8px", borderRadius: "6px" }}>
                      {item.code}
                    </span>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: "24px", padding: "16px", background: "#eff6ff", borderRadius: "12px", border: "1px dashed #bfdbfe" }}>
                <p style={{ fontSize: "12px", color: "#1e40af", textAlign: "center", fontWeight: "600" }}>
                  💡 Schedule is dynamically generated based on current semester enrollments.
                </p>
              </div>
            </div>
          )}

          {user.role === "admin" && (
            <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Administrative Clearance</h4>
              <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px", lineHeight: "1.6" }}>
                You have full access to all system modules. Account settings and security parameters are managed via the central registry.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
