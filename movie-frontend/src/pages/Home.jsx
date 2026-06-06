import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieModal from "../components/MovieModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const GENRE_EMOJIS = {
  action: "💥", comedy: "😂", drama: "🎭", horror: "👻",
  romance: "💕", "sci-fi": "🚀", thriller: "🔪",
  animation: "🎨", documentary: "🎥", fantasy: "🧙",
};

const TMDB_GENRE_IDS = {
  action: 28, comedy: 35, drama: 18, horror: 27,
  romance: 10749, "sci-fi": 878, thriller: 53,
  animation: 16, documentary: 99, fantasy: 14,
};

function MovieCard({ movie, onClick }) {
  return (
    <div style={s.card} onClick={onClick}>
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : "https://via.placeholder.com/300x450?text=No+Image"
        }
        alt={movie.title}
        style={s.poster}
      />
      <div style={s.cardInfo}>
        <p style={s.cardTitle}>{movie.title}</p>
        <p style={s.cardRating}>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>
      </div>
    </div>
  );
}

function Section({ title, movies, loading, onMovieClick }) {
  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {loading ? (
        <p style={s.loading}>Loading...</p>
      ) : movies.length === 0 ? (
        <p style={s.loading}>No movies found for this filter.</p>
      ) : (
        <div style={s.row}>
          {movies.slice(0, 20).map((m) => (
            <MovieCard key={m.id} movie={m} onClick={() => onMovieClick(m)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const [user, setUser] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [activeGenre, setActiveGenre] = useState("all");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
   // const stored = localStorage.getItem("user");
   // SAFE
const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!stored) return navigate("/login");

    const u = JSON.parse(stored);
    setUser(u);

    if (!sessionStorage.getItem("welcomed")) {
      setShowWelcome(true);
      sessionStorage.setItem("welcomed", "1");
      setTimeout(() => setShowWelcome(false), 4000);
    }

    fetchRecommendations(u.genres || []);
  }, []);

  const fetchRecommendations = async (genres) => {
    try {
      setLoadingRec(true);
      const res = await axios.post(`${API}/recommend`, { genres });
      setRecommended(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      setLoadingSearch(true);
      const res = await axios.get(`${API}/movies/search/${search}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const filteredMovies =
    activeGenre === "all"
      ? recommended
      : recommended.filter((m) =>
          m.genre_ids?.includes(TMDB_GENRE_IDS[activeGenre])
        );

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div style={s.page}>
      <Navbar user={user} />

      {/* Welcome Banner */}
      {showWelcome && user && (
        <div style={s.welcomeBanner}>
          <span style={s.welcomeEmoji}>👋</span>
          <span>
            Welcome back, <strong>{user.name}</strong>! Ready to watch something great?
          </span>
        </div>
      )}

      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>
          {user ? `Hey ${user.name} 👋` : "Welcome to MovieFlix"}
        </h1>
        <p style={s.heroSub}>
          {user?.genres?.length > 0
            ? `Your Genres: ${user.genres.map(capitalize).join(", ")}`
            : "Discover movies you'll love"}
        </p>

        {/* Search */}
        <div style={s.searchRow}>
          <input
            style={s.searchInput}
            placeholder="Search for any movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={s.searchBtn} onClick={handleSearch}>
            {loadingSearch ? "..." : "Search"}
          </button>
        </div>
      </div>

      <div style={s.content}>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <Section
            title={`🔍 Results for "${search}"`}
            movies={searchResults}
            loading={false}
            onMovieClick={setSelectedMovie}
          />
        )}

        {/* Genre Filter Bar */}
        {user?.genres?.length > 1 && (
          <div style={s.filterBar}>
            <button
              style={{ ...s.filterChip, ...(activeGenre === "all" ? s.filterActive : {}) }}
              onClick={() => setActiveGenre("all")}
            >
              🎬 All
            </button>
            {user.genres.map((g) => (
              <button
                key={g}
                style={{ ...s.filterChip, ...(activeGenre === g ? s.filterActive : {}) }}
                onClick={() => setActiveGenre(g)}
              >
                {GENRE_EMOJIS[g] || "🎥"} {capitalize(g)}
              </button>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <Section
          title={
            activeGenre === "all"
              ? "🎯 Recommended for You"
              : `${GENRE_EMOJIS[activeGenre] || "🎥"} ${capitalize(activeGenre)} Picks`
          }
          movies={filteredMovies}
          loading={loadingRec}
          onMovieClick={setSelectedMovie}
        />
      </div>

      {/* Movie Modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

    </div>
  );
}

export default Home;

const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "'Segoe UI', sans-serif",
  },
  welcomeBanner: {
    background: "linear-gradient(135deg, #e50914, #b00610)",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "15px",
    fontWeight: "500",
  },
  welcomeEmoji: { fontSize: "22px" },
  hero: {
    padding: "60px 40px 40px",
    textAlign: "center",
    background: "linear-gradient(to bottom, rgba(229,9,20,0.08), transparent)",
  },
  heroTitle: {
    fontSize: "48px", fontWeight: "800", margin: "0 0 12px",
    background: "linear-gradient(135deg, #fff 60%, rgba(255,255,255,0.5))",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    color: "rgba(255,255,255,0.5)", fontSize: "16px",
    marginBottom: "32px", textTransform: "capitalize",
  },
  searchRow: { display: "flex", maxWidth: "500px", margin: "0 auto", gap: "10px" },
  searchInput: {
    flex: 1, padding: "14px 18px", borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.07)", color: "white",
    fontSize: "15px", outline: "none",
  },
  searchBtn: {
    padding: "14px 24px", borderRadius: "12px", border: "none",
    background: "#e50914", color: "white", fontWeight: "700",
    fontSize: "15px", cursor: "pointer",
  },
  content: { padding: "0 32px 60px" },
  filterBar: {
    display: "flex", flexWrap: "wrap", gap: "10px",
    marginBottom: "28px", paddingTop: "8px",
  },
  filterChip: {
    padding: "8px 18px", borderRadius: "50px",
    border: "2px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.6)", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
  },
  filterActive: {
    border: "2px solid #e50914",
    background: "rgba(229,9,20,0.2)",
    color: "white", boxShadow: "0 0 12px rgba(229,9,20,0.3)",
  },
  section: { marginBottom: "48px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "white" },
  loading: { color: "rgba(255,255,255,0.4)", padding: "20px 0" },
  row: {
    display: "flex", gap: "16px", overflowX: "auto",
    paddingBottom: "12px", scrollbarWidth: "thin",
    scrollbarColor: "#e50914 transparent",
  },
  card: {
    minWidth: "160px", maxWidth: "160px", background: "#1e293b",
    borderRadius: "12px", overflow: "hidden", flexShrink: 0,
    cursor: "pointer", transition: "transform 0.2s",
  },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" },
  cardInfo: { padding: "10px" },
  cardTitle: {
    fontSize: "13px", fontWeight: "600", color: "white",
    margin: "0 0 4px", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  cardRating: { fontSize: "12px", color: "#fbbf24", margin: 0 },
};