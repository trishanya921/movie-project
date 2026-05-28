import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieModal from "../components/MovieModal";

const API = "http://localhost:3000/api";

function Search() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const searchMovies = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/movies/search/${query}`);
      setMovies(res.data);
    } catch (err) {
      alert("Search failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar user={user} />
      <div style={s.content}>
        <h1 style={s.title}>🔍 Search Movies</h1>
        <div style={s.searchRow}>
          <input
            style={s.input}
            placeholder="Search for any movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMovies()}
          />
          <button style={s.btn} onClick={searchMovies}>
            {loading ? "..." : "Search"}
          </button>
        </div>

        {movies.length > 0 && (
          <div style={s.grid}>
            {movies.map((movie) => (
              <div key={movie.id} style={s.card} onClick={() => setSelectedMovie(movie)}>
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  style={s.poster}
                />
                <div style={s.cardInfo}>
                  <p style={s.cardTitle}>{movie.title}</p>
                  <p style={s.rating}>⭐ {movie.vote_average?.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}

export default Search;

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "24px" },
  searchRow: { display: "flex", gap: "12px", marginBottom: "32px", maxWidth: "500px" },
  input: { flex: 1, padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)", color: "white", fontSize: "15px", outline: "none" },
  btn: { padding: "14px 24px", borderRadius: "12px", border: "none", background: "#e50914", color: "white", fontWeight: "700", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" },
  card: { background: "#1e293b", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover" },
  cardInfo: { padding: "10px" },
  cardTitle: { fontSize: "13px", fontWeight: "600", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rating: { fontSize: "12px", color: "#fbbf24", margin: 0 },
};