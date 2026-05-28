import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "http://localhost:3000/api";
const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Animation", "Documentary", "Fantasy"];

export default function GroupWatch() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [view, setView] = useState("home");
  const [joinCode, setJoinCode] = useState("");
  const [group, setGroup] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState(user.genres || []);

  const toggleGenre = (g) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const createGroup = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/groups/create`, {
        userId: user.userId || user._id || "guest",
        userName: user.name || user.username || "You",
        genres: selectedGenres,
      });
      setGroup(res.data.group);
      setView("group");
    } catch { alert("Failed to create group"); }
    finally { setLoading(false); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return alert("Enter an invite code");
    try {
      setLoading(true);
      const res = await axios.post(`${API}/groups/join`, {
        code: joinCode.trim().toUpperCase(),
        userId: user.userId || user._id || "guest",
        userName: user.name || user.username || "You",
        genres: selectedGenres,
      });
      setGroup(res.data.group);
      setView("group");
    } catch (err) { alert(err.response?.data?.error || "Failed to join group"); }
    finally { setLoading(false); }
  };

  const getRecommendations = async () => {
    if (!group) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/groups/${group.code}/recommend`);
      setRecommendations(res.data.genres || []);
      if (res.data.genres?.length > 0) {
        const topGenres = res.data.genres.slice(0, 2).map((g) => g.genre);
        const movieResults = await Promise.all(
          topGenres.map((g) =>
            axios.get(`${API}/movies/genre/${g}`).then((r) => r.data).catch(() => [])
          )
        );
        const all = movieResults.flat();
        const seen = new Set();
        setMovies(all.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; }).slice(0, 12));
      }
    } catch { alert("Failed to get recommendations"); }
    finally { setLoading(false); }
  };

  const copyCode = () => { navigator.clipboard.writeText(group?.code || ""); alert("Code copied!"); };

  return (
    <div style={s.page}>
      <Navbar user={user} />

      <div style={s.content}>
        <h1 style={s.title}>👥 Group Watch</h1>
        <p style={s.sub}>Find movies everyone in your group will enjoy</p>

        {view === "home" && (
          <div style={s.optionGrid}>
            <div style={s.optionCard} onClick={() => setView("create")}>
              <div style={s.optionIcon}>🎬</div>
              <div style={s.optionTitle}>Create a Group</div>
              <div style={s.optionDesc}>Start a new group and invite friends</div>
            </div>
            <div style={s.optionCard} onClick={() => setView("join")}>
              <div style={s.optionIcon}>🔗</div>
              <div style={s.optionTitle}>Join a Group</div>
              <div style={s.optionDesc}>Enter an invite code to join</div>
            </div>
          </div>
        )}

        {(view === "create" || view === "join") && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>{view === "create" ? "Create Group" : "Join Group"}</h2>
            {view === "join" && (
              <input style={s.input} placeholder="Enter 6-character invite code (e.g. A1B2C3)"
                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
            )}
            <p style={s.label}>Your genre preferences:</p>
            <div style={{ marginBottom: "20px" }}>
              {GENRES.map((g) => (
                <span key={g} onClick={() => toggleGenre(g)} style={{
                  ...s.genreChip,
                  background: selectedGenres.includes(g) ? "#e50914" : "rgba(229,9,20,0.1)",
                  color: selectedGenres.includes(g) ? "#fff" : "rgba(255,255,255,0.6)",
                }}>{g}</span>
              ))}
            </div>
            <div style={s.btnRow}>
              <button style={s.btn} onClick={view === "create" ? createGroup : joinGroup} disabled={loading}>
                {loading ? "..." : view === "create" ? "Create Group" : "Join Group"}
              </button>
              <button style={s.btnGhost} onClick={() => setView("home")}>Back</button>
            </div>
          </div>
        )}

        {view === "group" && group && (
          <>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>{group.name}</h2>
                <span style={s.badge}>{group.members.length} members</span>
              </div>
              <p style={s.label}>INVITE CODE — share with friends</p>
              <div style={s.codeBox}>
                <div style={s.codeText}>{group.code}</div>
                <button style={{ ...s.btnGhost, marginTop: "10px", fontSize: "13px" }} onClick={copyCode}>📋 Copy Code</button>
              </div>
              <p style={s.label}>MEMBERS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {group.members.map((m) => (
                  <div key={m.userId} style={s.memberChip}>
                    👤 {m.name}
                    {(m.genres || []).map((g) => (
                      <span key={g} style={{ color: "#e50914", fontSize: "11px", marginLeft: "4px" }}>#{g}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button style={{ ...s.btn, width: "100%", padding: "14px", marginBottom: "24px" }}
              onClick={getRecommendations} disabled={loading}>
              {loading ? "Finding movies..." : "🎯 Find Movies For Everyone"}
            </button>

            {recommendations.length > 0 && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>🏆 Genre Overlap</h2>
                {recommendations.map((r) => (
                  <div key={r.genre} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <span style={s.genreChip}>{r.genre}</span>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "8px" }}>
                      <div style={{ width: `${(r.count / r.members) * 100}%`, background: "#e50914", height: "100%", borderRadius: "4px" }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{r.count}/{r.members}</span>
                  </div>
                ))}
              </div>
            )}

            {movies.length > 0 && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>🎬 Recommended For Your Group</h2>
                <div style={s.movieGrid}>
                  {movies.map((m) => (
                    <div key={m.id} style={s.movieCard}>
                      {m.poster_path
                        ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} style={{ width: "100%", display: "block" }} />
                        : <div style={{ height: "180px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>No Image</div>}
                      <div style={{ padding: "8px", fontSize: "12px", fontWeight: "600", color: "white" }}>{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px", maxWidth: "800px", margin: "0 auto" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "32px" },
  optionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  optionCard: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px 24px", textAlign: "center", cursor: "pointer" },
  optionIcon: { fontSize: "40px", marginBottom: "12px" },
  optionTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "6px" },
  optionDesc: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
  card: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  cardTitle: { fontSize: "18px", fontWeight: "700", margin: "0 0 16px" },
  label: { fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" },
  input: { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "16px" },
  genreChip: { display: "inline-block", border: "1px solid rgba(229,9,20,0.4)", borderRadius: "20px", padding: "5px 14px", margin: "3px", fontSize: "13px", cursor: "pointer" },
  btnRow: { display: "flex", gap: "10px" },
  btn: { padding: "12px 24px", background: "#e50914", border: "none", borderRadius: "10px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
  btnGhost: { padding: "12px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "14px" },
  badge: { background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.4)", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#e50914", fontWeight: "700" },
  codeBox: { background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(229,9,20,0.4)", borderRadius: "12px", padding: "16px 24px", textAlign: "center", marginBottom: "20px" },
  codeText: { fontSize: "32px", fontWeight: "900", letterSpacing: "8px", color: "#e50914" },
  memberChip: { display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "6px 14px", fontSize: "13px" },
  movieGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px", marginTop: "12px" },
  movieCard: { borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" },
};