import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modal: {
    background: "#141414", borderRadius: "20px", width: "100%",
    maxWidth: "780px", maxHeight: "90vh", overflowY: "auto",
    border: "1px solid #2a2a2a", position: "relative",
  },
  backdrop: {
    width: "100%", height: "280px", objectFit: "cover",
    borderRadius: "20px 20px 0 0", display: "block",
  },
  backdropPlaceholder: {
    width: "100%", height: "280px", background: "#1a1a1a",
    borderRadius: "20px 20px 0 0",
  },
  closeBtn: {
    position: "absolute", top: "14px", right: "14px",
    background: "rgba(0,0,0,0.7)", border: "none", color: "#fff",
    borderRadius: "50%", width: "36px", height: "36px",
    fontSize: "18px", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  body: { padding: "24px" },
  title: { fontSize: "24px", fontWeight: "800", marginBottom: "8px" },
  metaRow: {
    display: "flex", gap: "16px", alignItems: "center",
    marginBottom: "16px", flexWrap: "wrap",
  },
  badge: {
    background: "#252525", border: "1px solid #333", borderRadius: "6px",
    padding: "4px 10px", fontSize: "12px", color: "#aaa",
  },
  ratingBadge: {
    background: "#e5091422", border: "1px solid #e50914",
    borderRadius: "6px", padding: "4px 10px",
    fontSize: "12px", color: "#e50914", fontWeight: "700",
  },
  overview: { color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" },
  trailerBox: {
    borderRadius: "12px", overflow: "hidden",
    aspectRatio: "16/9", marginBottom: "20px", background: "#000",
  },
  iframe: { width: "100%", height: "100%", border: "none" },
  noTrailer: {
    height: "200px", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#555", fontSize: "14px",
    background: "#1a1a1a", borderRadius: "12px", marginBottom: "20px",
  },
  actionRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  btn: {
    padding: "10px 20px", background: "#e50914", border: "none",
    borderRadius: "10px", color: "#fff", fontWeight: "700",
    cursor: "pointer", fontSize: "13px",
  },
  btnGhost: {
    padding: "10px 20px", background: "transparent",
    border: "1px solid #333", borderRadius: "10px",
    color: "#aaa", cursor: "pointer", fontSize: "13px",
  },
};

const formatRuntime = (mins) => {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function MovieModal({ movie, onClose }) {
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.userId || user._id || "guest";

  useEffect(() => {
    if (!movie) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [detailsRes, trailerRes] = await Promise.all([
          axios.get(`${API}/movies/details/${movie.id}`),
          axios.get(`${API}/movies/trailer/${movie.id}`),
        ]);
        setDetails(detailsRes.data);
        setTrailerKey(trailerRes.data.trailer);
      } catch { }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [movie]);

  const markWatching = async () => {
    try {
      await axios.post(`${API}/progress`, {
        userId,
        movieId: String(movie.id),
        movieTitle: movie.title,
        poster: movie.poster_path,
        status: "watching",
        percent: 0,
        totalMinutes: details?.runtime || 0,
        watchedMinutes: 0,
      });
      alert(`✅ "${movie.title}" added to your watch progress!`);
    } catch { alert("Failed to add to progress"); }
  };

  if (!movie) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Backdrop */}
        {movie.backdrop_path
          ? <img src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`} alt="" style={s.backdrop} />
          : <div style={s.backdropPlaceholder} />}

        {/* Close Button */}
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        <div style={s.body}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>Loading...</div>
          ) : (
            <>
              <div style={s.title}>{details?.title || movie.title}</div>

              {/* Meta */}
              <div style={s.metaRow}>
                {details?.releaseYear && <span style={s.badge}>📅 {details.releaseYear}</span>}
                {details?.runtime && <span style={s.badge}>⏱ {formatRuntime(details.runtime)}</span>}
                {details?.rating && <span style={s.ratingBadge}>⭐ {details.rating.toFixed(1)}</span>}
              </div>

              {/* Overview */}
              {details?.overview && <p style={s.overview}>{details.overview}</p>}

              {/* Trailer */}
              {trailerKey ? (
                <div style={s.trailerBox}>
                  <iframe
                    style={s.iframe}
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0`}
                    title="Trailer"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
              ) : (
                <div style={s.noTrailer}>🎬 No trailer available</div>
              )}

              {/* Actions */}
              <div style={s.actionRow}>
                <button style={s.btn} onClick={markWatching}>▶ Start Watching</button>
                <button style={s.btnGhost} onClick={onClose}>Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}