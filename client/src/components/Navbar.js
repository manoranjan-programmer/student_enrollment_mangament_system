import React from "react";

const Navbar = ({ onLogout }) => (
  <header className="navbar">
    <div className="navbar-left">
      <p className="navbar-sub">Academic Operations Dashboard</p>
      <h1>Intelligence Console</h1>
    </div>
    <div className="navbar-right">
      <button className="btn" onClick={onLogout} style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px",
        background: "var(--bg-soft)", 
        color: "var(--text-main)",
        border: "1px solid var(--border)",
        padding: "10px 20px",
        borderRadius: "12px",
        fontWeight: "600"
      }}>
        <span>Sign Out</span>
        <span style={{ fontSize: "16px" }}>↪</span>
      </button>
    </div>
  </header>
);

export default Navbar;
