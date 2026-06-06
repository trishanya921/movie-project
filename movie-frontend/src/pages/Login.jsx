import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Fill in all fields");
    try {
      setLoading(true);
      const res = await axios.post(`${API}/users/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // If user already has genres saved, go home; else go to genre picker
      if (res.data.user.genres && res.data.user.genres.length > 0) {
        navigate("/");
      } else {
        navigate("/genres");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return alert("Fill in all fields");
    try {
      setLoading(true);
      const res = await axios.post(`${API}/users/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/genres"); // always pick genres after registering
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>🎬</div>
        <h1 style={s.title}>MovieFlix</h1>
        <p style={s.sub}>Your personal cinema guide</p>

        {/* Tabs */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(tab === "login" ? s.tabActive : {}) }}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            style={{ ...s.tab, ...(tab === "register" ? s.tabActive : {}) }}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {/* Form */}
        {tab === "register" && (
          <input
            style={s.input}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          style={s.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={s.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
        />

        <button
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
          onClick={tab === "login" ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? "Please wait..." : tab === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default Login;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "380px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },
  logo: { fontSize: "48px", marginBottom: "8px" },
  title: { fontSize: "32px", fontWeight: "700", margin: "0 0 6px", color: "#fff" },
  sub: { color: "rgba(255,255,255,0.5)", marginBottom: "28px", fontSize: "14px" },
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "24px",
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#e50914",
    color: "white",
    boxShadow: "0 4px 12px rgba(229,9,20,0.4)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.07)",
    color: "white",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #e50914, #b00610)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 6px 20px rgba(229,9,20,0.35)",
    transition: "opacity 0.2s",
  },
};