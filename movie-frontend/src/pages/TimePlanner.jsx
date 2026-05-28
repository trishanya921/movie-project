import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieModal from "../components/MovieModal";

const API = "http://localhost:3000/api";

const QUICK_TIMES = [
  { label: "30 min", value: 30, emoji: "⚡" },
  { label: "1 hour", value: 60, emoji: "🕐" },
  { label: "1.5 hours", value: 90, emoji: "🕑" },
  { label: "2 hours", value: 120, emoji: "🕒" },
  { label: "2.5 hours", value: 150, emoji: "🕓" },
  { label: "3+ hours", value: 180, emoji: "🎬" },
];

const GENRES = [
  "Action", "Comedy", "Drama", "Horror",
  "Romance", "Sci-Fi", "Thriller", "Animation",
  "Documentary", "Fantasy"
];

export default function TimePlanner() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [minutes, setMinutes] = useState("");
  const [buffer, setBuffer] = useState(10);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const toggleGenre = (g) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const findMovies = async () => {
    if (!minutes || minutes < 10) return alert("Enter at least 10 minutes");
    try {
      setLoading(true);
      setSearched(false);

      const maxRuntime = parseInt(minutes);
      const minRuntime = Math.max(10, maxRuntime - parseInt(buffer));

      // Fetch from genres user selected or their saved genres
      const genresToUse =
        selectedGenres.length > 0
          ? selectedGenres
          : user.genres || ["Action", "Comedy"];

      // Fetch movies for each genre in parallel
      const results = await Promise.all(
        genresToUse.map((g) =>
          axios
            .get(`${API}/movies/genre/${g}`)
            .then((r) => r.data)
            .catch(() => [])
        )
      );

      const all = results.flat();

      // Deduplicate
      const seen = new Set();
      const unique = all.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      // Fetch runtime for each movie (in batches of 10 to avoid overload)
      const batch = unique.slice(0, 40); // limit to 40 candidates
      const withRuntime = await Promise.all(
        batch.map(async (m) => {
          try {
            const res = await axios.get(`${API}/movies/details/${m.id}`);
            return { ...m, runtime: res.data.runtime || 0 };
          } catch {
            return { ...m, runtime: 0 };
          }
        })
      );

      // Filter by runtime range
      const filtered = withRuntime
        .filter((m) => m.runtime >= minRuntime && m.runtime <= maxRuntime)
        .sort((a, b) => b.vote_average - a.vote_average);

      setMovies(filtered);
      setSearched(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatRuntime = (mins) => {
    if (!mins) return "?";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={s.page}>
      <Navbar user={user} />

      <div style={s.content}>
        <h1 style={s.title}>⏱ Time Planner</h1>
        <p style={s.sub}>Tell us how much time you have — we'll find the perfect movie</p>

        {/* Quick Time Buttons */}
        <div style={s.quickRow}>
          {QUICK_TIMES.map((t) => (
            <button
              key={t.value}
              style={{
                ...s.quickBtn,
                ...(parseInt(minutes) === t.value ? s.quickBtnActive : {}),
              }}
              onClick={() => setMinutes(String(t.value))}
            >
              <span style={{ fontSize: "20px" }}>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div style={s.inputCard}>
          <div style={s.inputRow}>
            <div style={s.inputGroup}>
              <label style={s.label}>YOUR AVAILABLE TIME</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  style={s.input}
                  type="number"
                  placeholder="e.g. 75"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="10"
                  max="300"
                />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>minutes</span>
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>BUFFER TIME (±{buffer} min)</label>
              <input
                type="range"
                min="0"
                max="30"
                value={buffer}
                onChange={(e) => setBuffer(e.target.value)}
                style={{ width: "100%", accentColor: "#e50914", marginTop: "10px" }}
              />
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                Will show movies between {Math.max(0, parseInt(minutes || 0) - parseInt(buffer))}–{parseInt(minutes || 0)} mins
              </div>
            </div>
          </div>

          {/* Genre Filter */}
          <div style={{ marginBottom: "20px" }}>
            <label style={s.label}>FILTER BY GENRE (optional — leave empty to use your saved genres)</label>
            <div style={{ marginTop: "10px" }}>
              {GENRES.map((g) => (
                <span
                  key={g}
                  onClick={() => toggleGenre(g)}
                  style={{
                    ...s.genreChip,
                    background: selectedGenres.includes(g) ? "#e50914" : "rgba(229,9,20,0.08)",
                    color: selectedGenres.includes(g) ? "#fff" : "rgba(255,255,255,0.5)",
                    borderColor: selectedGenres.includes(g) ? "#e50914" : "rgba(255,255,255,0.1)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            onClick={findMovies}
            disabled={loading}
          >
            {loading ? "Finding movies..." : "🎯 Find Movies"}
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div style={s.loadingBox}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎬</div>
            <div>Checking runtimes for you...</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
              This may take a few seconds
            </div>
          </div>
        )}

        {!loading && searched && movies.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>😕</div>
            <div>No movies found for {minutes} minutes</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
              Try increasing the buffer time or picking different genres
            </div>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <>
            <div style={s.resultsHeader}>
              <h2 style={s.resultsTitle}>
                🎬 {movies.length} movies that fit in {minutes} minutes
              </h2>
              <span style={s.badge}>Sorted by rating</span>
            </div>

            <div style={s.grid}>
              {movies.map((m) => (
                <div
                  key={m.id}
                  style={s.card}
                  onClick={() => setSelectedMovie(m)}
                >
                  {m.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                      alt={m.title}
                      style={s.poster}
                    />
                  ) : (
                    <div style={s.noPoster}>No Image</div>
                  )}
                  {/* Runtime badge */}
                  <div style={s.runtimeBadge}>⏱ {formatRuntime(m.runtime)}</div>
                  <div style={s.cardInfo}>
                    <p style={s.cardTitle}>{m.title}</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={s.rating}>⭐ {m.vote_average?.toFixed(1)}</span>
                      <span style={s.runtimeText}>{formatRuntime(m.runtime)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px", maxWidth: "960px", margin: "0 auto" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "28px" },
  quickRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" },
  quickBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
    padding: "14px 20px", background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px",
    color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px",
    fontWeight: "600", transition: "all 0.2s", minWidth: "90px",
  },
  quickBtnActive: {
    background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.5)",
    color: "#fff",
  },
  inputCard: {
    background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "24px", marginBottom: "32px",
  },
  inputRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" },
  input: {
    flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    color: "#fff", fontSize: "16px", outline: "none", fontWeight: "700",
    width: "120px",
  },
  genreChip: {
    display: "inline-block", border: "1px solid", borderRadius: "20px",
    padding: "5px 14px", margin: "3px", fontSize: "13px", cursor: "pointer",
    transition: "all 0.2s",
  },
  btn: {
    padding: "13px 28px", background: "#e50914", border: "none",
    borderRadius: "12px", color: "#fff", fontWeight: "700",
    cursor: "pointer", fontSize: "15px",
  },
  loadingBox: {
    textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.5)",
    background: "#1e293b", borderRadius: "16px",
  },
  empty: {
    textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.4)",
    background: "#1e293b", borderRadius: "16px",
  },
  resultsHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "20px",
  },
  resultsTitle: { fontSize: "20px", fontWeight: "700" },
  badge: {
    background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.3)",
    borderRadius: "6px", padding: "4px 12px", fontSize: "12px", color: "#e50914",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" },
  card: {
    background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px", overflow: "hidden", cursor: "pointer",
    position: "relative", transition: "transform 0.2s",
  },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" },
  noPoster: {
    height: "220px", background: "rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", color: "rgba(255,255,255,0.2)",
  },
  runtimeBadge: {
    position: "absolute", top: "8px", right: "8px",
    background: "rgba(0,0,0,0.85)", borderRadius: "6px",
    padding: "3px 8px", fontSize: "11px", fontWeight: "700", color: "#fff",
  },
  cardInfo: { padding: "10px" },
  cardTitle: {
    fontSize: "13px", fontWeight: "600", margin: "0 0 6px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  rating: { fontSize: "12px", color: "#fbbf24" },
  runtimeText: { fontSize: "12px", color: "rgba(255,255,255,0.4)" },
};