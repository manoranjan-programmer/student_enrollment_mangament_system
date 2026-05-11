import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ role }) => {
  const common = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/courses", label: "Courses", icon: "📚" },
    { to: "/profile", label: "Profile", icon: "👤" }
  ];
  const studentLinks = [
    { to: "/registration", label: "Registration", icon: "📝" },
    { to: "/results", label: "Results", icon: "🎓" }
  ];
  const facultyLinks = [
    { to: "/students", label: "Students", icon: "👥" },
    { to: "/results", label: "Results", icon: "🎓" },
    { to: "/attendance", label: "Attendance", icon: "📅" }
  ];
  const adminLinks = [
    { to: "/students", label: "Students", icon: "👥" },
    { to: "/faculty", label: "Faculty", icon: "👔" },
    { to: "/attendance", label: "Attendance", icon: "📅" }
  ];

  const links = [
    ...common,
    ...(role === "student" ? studentLinks : []),
    ...(role === "faculty" ? facultyLinks : []),
    ...(role === "admin" ? adminLinks : [])
  ];

  return (
    <aside className="sidebar">
      <div className="brand-block" style={{ paddingLeft: "12px" }}>
        <h2>EduInsight</h2>
        <p>Intelligence Platform</p>
      </div>
      <nav style={{ padding: "0 8px" }}>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="nav-item">
            <span className="nav-icon" style={{ fontSize: "20px" }}>{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
