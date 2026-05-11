import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ role, onLogout, children }) => (
  <div className="app-shell">
    <Sidebar role={role} />
    <div className="content-area">
      <Navbar onLogout={onLogout} />
      <main className="page-content">{children}</main>
    </div>
  </div>
);

export default Layout;
