import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieModal from "../components/MovieModal";

const API = "http://localhost:3000/api";

function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios.get(`${API}/movies/trending`)
      .then((r) => setMovies(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <Navbar user={user} />
      <div style={s.content}>
        <h1 style={s.title}>🔥 Trending Now</h1>
        {loading ? (
          <p style={s.loading}>Loading...</p>
        ) : (
          <div style={s.grid}>
            {movies.map((movie, i) => (
              <div key={movie.id} style={s.card} onClick={() => setSelectedMovie(movie)}>
                <div style={s.rank}>#{i + 1}</div>
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

export default Trending;

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "32px" },
  loading: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "60px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" },
  card: { background: "#1e293b", borderRadius: "12px", overflow: "hidden", cursor: "pointer", position: "relative", transition: "transform 0.2s" },
  rank: { position: "absolute", top: "8px", left: "8px", background: "#e50914", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontWeight: "700", zIndex: 1 },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover" },
  cardInfo: { padding: "10px" },
  cardTitle: { fontSize: "13px", fontWeight: "600", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rating: { fontSize: "12px", color: "#fbbf24", margin: 0 },
};