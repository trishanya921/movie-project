import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "http://localhost:3000/api";

export default function Rewatch() {
 const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user.userId || user._id || "guest";
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("top");

  useEffect(() => { fetchTop(); }, []);

  const fetchTop = async () => {
    try {
      const res = await axios.get(`${API}/rewatch/top/all`);
      setTopMovies(res.data);
    } catch { }
  };

  const search = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/movies/search/${encodeURIComponent(query)}`);
      setSearchResults(res.data.slice(0, 12));
      setView("search");
    } catch { }
    finally { setLoading(false); }
  };

  const selectMovie = async (movie) => {
    setSelected(movie);
    setView("vote");
    try {
      const [scoreRes, voteRes] = await Promise.all([
        axios.get(`${API}/rewatch/${movie.id}`),
        axios.get(`${API}/rewatch/${movie.id}/user/${userId}`),
      ]);
      setVoteResult(scoreRes.data);
      setUserVote(voteRes.data.vote);
    } catch { }
  };

  const vote = async (v) => {
    if (!selected) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API}/rewatch/vote`, {
        userId,
        movieId: String(selected.id),
        movieTitle: selected.title,
        poster: selected.poster_path,
        vote: v,
      });
      setVoteResult(res.data);
      setUserVote(v);
      fetchTop();
    } catch { alert("Failed to vote"); }
    finally { setLoading(false); }
  };

  const scoreColor = (score) => score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={s.page}>
      <Navbar user={user} />

      <div style={s.content}>
        <h1 style={s.title}>🔁 Rewatch Score</h1>
        <p style={s.sub}>Community votes on whether a movie is worth rewatching</p>

        {/* Search */}
        <div style={s.searchRow}>
          <input style={s.input} placeholder="Search a movie to rate..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()} />
          <button style={s.btn} onClick={search} disabled={loading}>{loading ? "..." : "Search"}</button>
          {view !== "top" && <button style={s.btnGhost} onClick={() => setView("top")}>← Back</button>}
        </div>

        {/* Search Results */}
        {view === "search" && (
          <div style={s.grid}>
            {searchResults.map((m) => (
              <div key={m.id} style={s.card} onClick={() => selectMovie(m)}>
                {m.poster_path
                  ? <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} alt={m.title} style={s.poster} />
                  : <div style={s.noPoster}>No Image</div>}
                <div style={s.cardInfo}><p style={s.cardTitle}>{m.title}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Vote View */}
        {view === "vote" && selected && (
          <div style={s.voteCard}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              {selected.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w92${selected.poster_path}`} alt={selected.title} style={{ borderRadius: "8px", height: "90px" }} />
              )}
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>{selected.title}</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Would you watch this again?</p>
              </div>
            </div>

            {userVote ? (
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
                  You voted: <span style={{ color: userVote === "yes" ? "#22c55e" : "#ef4444", fontWeight: "700" }}>{userVote === "yes" ? "👍 Yes" : "👎 No"}</span>
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button style={{ ...s.yesBtn, opacity: userVote === "yes" ? 1 : 0.4, padding: "10px 20px", fontSize: "14px" }} onClick={() => vote("yes")}>👍 Yes</button>
                  <button style={{ ...s.noBtn, opacity: userVote === "no" ? 1 : 0.4, padding: "10px 20px", fontSize: "14px" }} onClick={() => vote("no")}>👎 No</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <button style={s.yesBtn} onClick={() => vote("yes")} disabled={loading}>👍 Yes</button>
                <button style={s.noBtn} onClick={() => vote("no")} disabled={loading}>👎 No</button>
              </div>
            )}

            {voteResult && voteResult.total > 0 && (
              <div style={s.resultBox}>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>COMMUNITY REWATCH SCORE</p>
                <div style={{ fontSize: "48px", fontWeight: "900", color: scoreColor(voteResult.score) }}>{voteResult.score}%</div>
                <div style={{ fontSize: "16px", fontWeight: "700", marginTop: "6px" }}>{voteResult.verdict}</div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
                  👍 {voteResult.yes} &nbsp;|&nbsp; 👎 {voteResult.no} &nbsp;|&nbsp; {voteResult.total} total votes
                </p>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "8px", marginTop: "12px" }}>
                  <div style={{ width: `${voteResult.score}%`, height: "100%", background: scoreColor(voteResult.score), borderRadius: "4px", transition: "width 0.5s" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Rewatch Movies */}
        {view === "top" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>🏆 Most Rewatch-Worthy</h2>
            {topMovies.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</div>
                <div>No votes yet.</div>
                <div style={{ fontSize: "13px", marginTop: "6px", color: "rgba(255,255,255,0.3)" }}>Search for a movie and be the first to vote!</div>
              </div>
            ) : (
              topMovies.map((m, i) => (
                <div key={m.movieId} style={s.topCard} onClick={() => selectMovie({ id: m.movieId, title: m.movieTitle, poster_path: m.poster })}>
                  <div style={s.rank}>#{i + 1}</div>
                  {m.poster && <img src={`https://image.tmdb.org/t/p/w45${m.poster}`} alt={m.movieTitle} style={{ borderRadius: "6px", height: "50px" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{m.movieTitle}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>{m.total} votes</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: scoreColor(m.score) }}>{m.score}%</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>rewatch score</div>
                  </div>
                </div>
              ))
            )}
          </div>
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
  searchRow: { display: "flex", gap: "10px", marginBottom: "28px" },
  input: { flex: 1, padding: "12px 16px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "#fff", fontSize: "14px", outline: "none" },
  btn: { padding: "12px 24px", background: "#e50914", border: "none", borderRadius: "12px", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
  btnGhost: { padding: "12px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" },
  card: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer" },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" },
  noPoster: { height: "200px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "rgba(255,255,255,0.2)" },
  cardInfo: { padding: "10px" },
  cardTitle: { fontSize: "13px", fontWeight: "600", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  voteCard: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "28px", maxWidth: "440px" },
  yesBtn: { flex: 1, padding: "16px", background: "rgba(34,197,94,0.1)", border: "2px solid #22c55e", borderRadius: "14px", color: "#22c55e", fontWeight: "800", fontSize: "18px", cursor: "pointer" },
  noBtn: { flex: 1, padding: "16px", background: "rgba(239,68,68,0.1)", border: "2px solid #ef4444", borderRadius: "14px", color: "#ef4444", fontWeight: "800", fontSize: "18px", cursor: "pointer" },
  resultBox: { background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "20px", marginTop: "16px", textAlign: "center" },
  topCard: { display: "flex", alignItems: "center", gap: "14px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", marginBottom: "10px", cursor: "pointer" },
  rank: { fontSize: "20px", fontWeight: "900", color: "#e50914", width: "32px", textAlign: "center" },
  empty: { textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" },
};