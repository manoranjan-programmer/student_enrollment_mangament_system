import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Registration from "./pages/Registration";
import Results from "./pages/Results";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import Faculty from "./pages/Faculty";
import Toast from "./components/Toast";
import api from "./services/api";

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (user?.role === "student" && user.student_id) {
      api.get(`/results?studentId=${user.student_id}`)
        .then((r) => {
          const published = r.data.some((x) => x.records.some((rec) => rec.is_published));
          if (published) setToast("Results Published");
        })
        .catch(() => {
          // Suppress notification lookup failures to avoid app crashes on auth errors.
        });
    }
  }, [user]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <>
      <Layout role={user.role} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students role={user.role} />} />
          <Route path="/courses" element={<Courses role={user.role} />} />
          <Route path="/registration" element={user.role === "student" ? <Registration /> : <Navigate to="/" />} />
          <Route path="/results" element={<Results role={user.role} />} />
          <Route path="/attendance" element={user.role !== "student" ? <Attendance /> : <Navigate to="/" />} />
          <Route path="/faculty" element={user.role === "admin" ? <Faculty /> : <Navigate to="/" />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
};

export default App;
