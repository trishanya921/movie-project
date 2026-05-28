import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieModal from "../components/MovieModal";

const API = "http://localhost:3000/api";

function Recommend() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/login");

    const u = JSON.parse(stored);
    setUser(u);

    if (!u.genres || u.genres.length === 0) {
      navigate("/genres");
      return;
    }

    fetchRecommendations(u.genres);
  }, []);

  const fetchRecommendations = async (genres) => {
    try {
      const res = await axios.post(`${API}/recommend`, { genres });
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar user={user} />

      <div style={s.content}>
        <h1 style={s.title}>🎯 Recommended for You</h1>
        {user?.genres && (
          <p style={s.sub}>
            Based On Your Taste: {user.genres.join(", ")}
          </p>
        )}

        {loading ? (
          <p style={s.loading}>Loading your picks...</p>
        ) : (
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

export default Recommend;

const s = {
  page: { minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  content: { padding: "40px 32px" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
  sub: { color: "rgba(255,255,255,0.5)", marginBottom: "32px", textTransform: "capitalize" },
  loading: { color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "60px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" },
  card: { background: "#1e293b", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover" },
  cardInfo: { padding: "10px" },
  cardTitle: { fontSize: "13px", fontWeight: "600", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rating: { fontSize: "12px", color: "#fbbf24", margin: 0 },
};