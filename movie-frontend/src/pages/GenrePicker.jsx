import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

const GENRES = [
  { id: "action", label: "Action", emoji: "💥" },
  { id: "comedy", label: "Comedy", emoji: "😂" },
  { id: "drama", label: "Drama", emoji: "🎭" },
  { id: "horror", label: "Horror", emoji: "👻" },
  { id: "romance", label: "Romance", emoji: "💕" },
  { id: "sci-fi", label: "Sci-Fi", emoji: "🚀" },
  { id: "thriller", label: "Thriller", emoji: "🔪" },
  { id: "animation", label: "Animation", emoji: "🎨" },
  { id: "documentary", label: "Documentary", emoji: "🎥" },
  { id: "fantasy", label: "Fantasy", emoji: "🧙" },
];

function GenrePicker() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );

  const handleSave = async () => {
    if (selected.length === 0) return alert("Pick at least one genre!");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return navigate("/login");

    try {
      setLoading(true);
      await axios.post(`${API}/users/${user.id}/genres`, { genres: selected });
      localStorage.setItem("user", JSON.stringify({ ...user, genres: selected }));
      navigate("/");
    } catch (err) {
      alert("Failed to save genres ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.icon}>🎬</div>
        <h1 style={s.title}>What do you love watching?</h1>
        <p style={s.sub}>Pick one or more genres — we'll tailor your recommendations</p>

        <div style={s.grid}>
          {GENRES.map((g) => {
            const active = selected.includes(g.id);
            return (
              <button
                key={g.id}
                style={{ ...s.chip, ...(active ? s.chipActive : {}) }}
                onClick={() => toggle(g.id)}
              >
                <span>{g.emoji}</span>
                <span>{g.label}</span>
                {active && <span style={s.check}>✓</span>}
              </button>
            );
          })}
        </div>

        <p style={s.count}>
          {selected.length === 0
            ? "No genres selected yet"
            : `${selected.length} genre${selected.length > 1 ? "s" : ""} selected`}
        </p>

        <button
          style={{ ...s.btn, opacity: selected.length === 0 || loading ? 0.5 : 1 }}
          onClick={handleSave}
          disabled={selected.length === 0 || loading}
        >
          {loading ? "Saving..." : "Let's Go 🎬"}
        </button>
      </div>
    </div>
  );
}

export default GenrePicker;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  container: { maxWidth: "560px", width: "100%", textAlign: "center", color: "white" },
  icon: { fontSize: "52px", marginBottom: "16px" },
  title: {
    fontSize: "32px", fontWeight: "800", marginBottom: "10px",
    background: "linear-gradient(135deg, #fff, #ccc)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  sub: { color: "rgba(255,255,255,0.5)", fontSize: "15px", marginBottom: "32px" },
  grid: { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "24px" },
  chip: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 20px", borderRadius: "50px",
    border: "2px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", transition: "all 0.2s",
  },
  chipActive: {
    border: "2px solid #e50914", background: "rgba(229,9,20,0.2)",
    color: "white", boxShadow: "0 0 16px rgba(229,9,20,0.3)",
  },
  check: { color: "#ff6b6b", fontWeight: "800" },
  count: { color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "24px" },
  btn: {
    width: "100%", padding: "16px",
    background: "linear-gradient(135deg, #e50914, #b00610)",
    border: "none", borderRadius: "14px", color: "white",
    fontSize: "17px", fontWeight: "700", cursor: "pointer",
    boxShadow: "0 6px 24px rgba(229,9,20,0.4)", transition: "opacity 0.2s",
  },
};