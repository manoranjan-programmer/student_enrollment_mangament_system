import React, { useState } from "react";
import api from "../services/api";

const Login = ({ onLogin }) => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedLoginId = loginId.trim();
      const { data } = await api.post("/auth/login", { login_id: normalizedLoginId, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("login_id", normalizedLoginId);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen" style={{ 
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div className="login-layout" style={{ 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <section className="login-brand-panel" style={{ 
          backgroundImage: `url('/login_bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          <div className="brand-content-overlay" style={{ 
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)', 
            position: 'absolute', inset: 0, padding: '60px', 
            display: 'flex', flexDirection: 'column', justifyContent: 'center' 
          }}>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ 
                background: "rgba(37, 99, 235, 0.2)", 
                color: "#60a5fa", 
                padding: "6px 14px", 
                borderRadius: "20px", 
                fontSize: "12px", 
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid rgba(37, 99, 235, 0.3)"
              }}>
                Intelligence Platform
              </span>
            </div>
            <h1 style={{ fontSize: "48px", fontWeight: "900", color: "#fff", lineHeight: "1.1", marginBottom: "24px", letterSpacing: "-0.04em" }}>
              EduInsight<br />
              <span style={{ color: "var(--accent)" }}>Management</span>
            </h1>
            <p style={{ fontSize: "17px", color: "#94a3b8", maxWidth: "420px", lineHeight: "1.6", marginBottom: "48px" }}>
              Streamlining academic operations through advanced data integration and identity management. Secure, scalable, and intuitive.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" }}>
              <div>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Institutional Security</span>
                <strong style={{ color: "#f1f5f9", fontSize: "15px" }}>AES-256 Encryption</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Compliance</span>
                <strong style={{ color: "#f1f5f9", fontSize: "15px" }}>FERPA Certified</strong>
              </div>
            </div>
          </div>
        </section>

        <form className="login-form" onSubmit={submit} style={{ padding: "60px", background: "#fff", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Welcome Back</h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Please enter your institutional credentials to continue.</p>
          </div>
          
          <div className="field-group" style={{ marginBottom: "24px" }}>
            <label className="field-label" style={{ fontSize: "12px", color: "#1e293b", fontWeight: "700", marginBottom: "8px", display: "block" }}>
              Institutional ID
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Roll No / Employee Code"
                required
                style={{ 
                  padding: "14px 16px", borderRadius: "10px", background: "#f8fafc", 
                  border: "1.5px solid #e2e8f0", fontSize: "14px", transition: "all 0.2s" 
                }}
              />
            </div>
          </div>
          
          <div className="field-group" style={{ marginBottom: "16px" }}>
            <label className="field-label" style={{ fontSize: "12px", color: "#1e293b", fontWeight: "700", marginBottom: "8px", display: "block" }}>
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ 
                padding: "14px 16px", borderRadius: "10px", background: "#f8fafc", 
                border: "1.5px solid #e2e8f0", fontSize: "14px"
              }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: "700", cursor: "pointer" }}>Request Access Recovery</span>
          </div>
          
          {error && (
            <div style={{ 
              padding: "12px", background: "#fef2f2", border: "1px solid #fee2e2", 
              borderRadius: "8px", color: "#b91c1c", fontSize: "13px", fontWeight: "600",
              textAlign: "center", marginBottom: "24px"
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <button 
            className="btn primary" 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", padding: "16px", borderRadius: "12px", 
              fontSize: "15px", fontWeight: "800", letterSpacing: "0.02em",
              boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
            }}
          >
            {loading ? "Verifying..." : "Authorize Login"}
          </button>
          
          <div style={{ marginTop: "auto", paddingTop: "40px", display: "flex", justifyContent: "center", gap: "24px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>System Status: <span style={{ color: "#10b981" }}>Operational</span></span>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>v2.4.2 Release</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
