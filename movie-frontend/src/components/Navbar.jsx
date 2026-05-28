import { Link, useNavigate } from "react-router-dom";

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("welcomed");
    navigate("/login");
  };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>🎬 MovieFlix</Link>

      <div style={s.links}>
        <Link to="/" style={s.link}>Home</Link>
        <Link to="/search" style={s.link}>Search</Link>
        <Link to="/recommend" style={s.link}>For You</Link>
        <Link to="/trending" style={s.link}>Trending</Link>
        <Link to="/group" style={s.link}>Group Watch</Link>
        <Link to="/progress" style={s.link}>My Progress</Link>
        <Link to="/rewatch" style={s.link}>Rewatch</Link>
        <Link to="/time" style={s.link}>⏱ Time Planner</Link>
      </div>

      <div style={s.right}>
        {user ? (
          <>
            <span style={s.userName}>👤 {user.name}</span>
            <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={s.loginBtn}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

const s = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", background: "rgba(15,23,42,0.95)",
    backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
    position: "sticky", top: 0, zIndex: 100,
  },
  brand: { fontSize: "20px", fontWeight: "800", color: "white", textDecoration: "none", letterSpacing: "-0.5px" },
  links: { display: "flex", gap: "24px", alignItems: "center" },
  link: { color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "15px", fontWeight: "500", transition: "color 0.2s" },
  right: { display: "flex", alignItems: "center", gap: "14px" },
  userName: { color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "500" },
  logoutBtn: {
    padding: "8px 16px", background: "rgba(229,9,20,0.15)",
    border: "1px solid rgba(229,9,20,0.4)", borderRadius: "8px",
    color: "#ff4d4d", fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  loginBtn: {
    padding: "8px 18px", background: "#e50914", borderRadius: "8px",
    color: "white", textDecoration: "none", fontSize: "14px", fontWeight: "600",
  },
};