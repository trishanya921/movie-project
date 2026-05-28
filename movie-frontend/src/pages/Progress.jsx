import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "http://localhost:3000/api";
const statusColors = { watching: "#3b82f6", finished: "#22c55e", abandoned: "#ef4444" };
const statusIcons = { watching: "▶️", finished: "✅", abandoned: "❌" };

export default function Progress() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.userId || user._id || "guest";
  const [activeTab, setActiveTab] = useState("watching");
  const [data, setData] = useState({ watching: [], finished: [], abandoned: [], total: 0 });
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("watching");
  const [watchedMins, setWatchedMins] = useState(0);
  const [totalMins, setTotalMins] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProgress(); fetchStats(); }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API}/progress/${userId}`);
      setData(res.data);
    } catch { }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/progress/${userId}/stats/summary`);
      setStats(res.data);
    } catch { }
  };

  const openModal = (movie) => {
    setModal(movie);
    setPercent(movie.percent || 0);
    setStatus(movie.status || "watching");
    setWatchedMins(movie.watchedMinutes || 0);
    setTotalMins(movie.totalMinutes || 0);
  };

  const saveProgress = async () => {
    if (!modal) return;
    try {
      setLoading(true);
      await axios.post(`${API}/progress`, {
        userId,
        movieId: modal.movieId,
        movieTitle: modal.movieTitle,
        poster: modal.poster,
        status,
        percent: parseInt(percent),
        watchedMinutes: parseInt(watchedMins),
        totalMinutes: parseInt(totalMins),
      });
      setModal(null);
      fetchProgress();
      fetchStats();
    } catch { alert("Failed to save"); }
    finally { setLoading(false); }
  };

  const deleteProgress = async (movieId) => {
    if (!confirm("Remove this movie from tracking?")) return;
    try {
      await axios.delete(`${API}/progress/${userId}/${movieId}`);
      fetchProgress();
      fetchStats();
    } catch { }
  };

  const movies = data[activeTab] || [];

  return (
    <div style={s.page}>
      <Navbar user={user} />

      <div style={s.content}>
        <h1 style={s.title}>📊 My Watch Progress</h1>
        <p style={s.sub}>Track what you're watching, finished, or gave up on</p>

        {/* Stats */}
        {stats && (
          <div style={s.statsRow}>
            <div style={s.statCard}><div style={s.statNum}>{stats.totalMovies}</div><div style={s.statLabel}>Total Tracked</div></div>
            <div style={s.statCard}><div style={{ ...s.statNum, color: "#3b82f6" }}>{stats.watching}</div><div style={s.statLabel}>Watching</div></div>
            <div style={s.statCard}><div style={{ ...s.statNum, color: "#22c55e" }}>{stats.finished}</div><div style={s.statLabel}>Finished</div></div>
            <div style={s.statCard}><div style={{ ...s.statNum, color: "#ef4444" }}>{stats.abandoned}</div><div style={s.statLabel}>Abandoned</div></div>
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabs}>
          {["watching", "finished", "abandoned"].map((t) => (
            <button key={t} style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }} onClick={() => setActiveTab(t)}>
              {statusIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)} ({data[t]?.length || 0})
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {movies.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</div>
            <div>No movies here yet.</div>
            <div style={{ fontSize: "13px", marginTop: "6px", color: "rgba(255,255,255,0.3)" }}>Click a movie and hit "Start Watching" to track it!</div>
          </div>
        ) : (
          <div style={s.grid}>
            {movies.map((m) => (
              <div key={m.movieId} style={s.card}>
                {m.poster
                  ? <img src={`https://image.tmdb.org/t/p/w300${m.poster}`} alt={m.movieTitle} style={s.poster} />
                  : <div style={s.noPoster}>No Image</div>}
                <div style={s.cardInfo}>
                  <p style={s.cardTitle}>{m.movieTitle}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: statusColors[m.status], fontWeight: "600" }}>{statusIcons[m.status]} {m.status}</span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{m.percent}%</span>
                  </div>
                  <div style={s.progressBar}>
                    <div style={{ width: `${m.percent}%`, height: "100%", background: statusColors[m.status], borderRadius: "2px" }} />
                  </div>
                  {m.totalMinutes > 0 && (
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                      ⏱ {m.watchedMinutes} / {m.totalMinutes} mins
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    <button style={{ ...s.btn, flex: 1, fontSize: "12px", padding: "7px" }} onClick={() => openModal(m)}>Update</button>
                    <button style={{ ...s.btnGhost, padding: "7px 10px", fontSize: "12px" }} onClick={() => deleteProgress(m.movieId)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Update Progress</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>{modal.movieTitle}</p>

            <p style={s.label}>Status</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {["watching", "finished", "abandoned"].map((st) => (
                <button key={st} onClick={() => { setStatus(st); if (st === "finished") setPercent(100); }}
                  style={{ flex: 1, padding: "9px", borderRadius: "10px", border: `1px solid ${status === st ? statusColors[st] : "rgba(255,255,255,0.1)"}`, background: status === st ? `${statusColors[st]}22` : "transparent", color: status === st ? statusColors[st] : "rgba(255,255,255,0.5)", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
                  {statusIcons[st]} {st}
                </button>
              ))}
            </div>

            <p style={s.label}>Progress: {percent}%</p>
            <input type="range" min="0" max="100" value={percent} onChange={(e) => setPercent(e.target.value)}
              style={{ width: "100%", accentColor: "#e50914", marginBottom: "20px" }} />

            <p style={s.label}>Time Watched (minutes)</p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input style={s.input} type="number" placeholder="Watched (e.g. 45)" value={watchedMins} onChange={(e) => setWatchedMins(e.target.value)} />
              <input style={s.input} type="number" placeholder="Total runtime (e.g. 120)" value={totalMins} onChange={(e) => setTotalMins(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...s.btn, flex: 1 }} onClick={saveProgress} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "32px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" },
  statCard: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" },
  statNum: { fontSize: "28px", fontWeight: "900", color: "#e50914" },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: { padding: "8px 20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  tabActive: { background: "#e50914", border: "1px solid #e50914", color: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  card: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", overflow: "hidden" },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" },
  noPoster: { height: "200px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "rgba(255,255,255,0.2)" },
  cardInfo: { padding: "12px" },
  cardTitle: { fontSize: "13px", fontWeight: "600", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  progressBar: { height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginTop: "6px" },
  empty: { textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px", width: "400px", maxWidth: "90vw" },
  label: { fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
  input: { flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { padding: "10px 20px", background: "#e50914", border: "none", borderRadius: "10px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
  btnGhost: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px" },
};