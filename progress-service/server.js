const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: [
    "https://movie-frontend-81o3.onrender.com",
    "https://api-gateway-bv7f.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

// In-memory storage
// progress: { [userId_movieId]: { userId, movieId, movieTitle, poster, status, percent, updatedAt } }
const progress = {};

const key = (userId, movieId) => `${userId}_${movieId}`;

// Status options: "watching" | "finished" | "abandoned"

// ── SAVE / UPDATE PROGRESS ────────────────────────────────────
app.post("/progress", (req, res) => {
  const { userId, movieId, movieTitle, poster, status, percent } = req.body;
  if (!userId || !movieId) return res.status(400).json({ error: "userId and movieId required" });

  const k = key(userId, movieId);
  progress[k] = {
    userId,
    movieId,
    movieTitle: movieTitle || "Unknown",
    poster: poster || null,
    status: status || "watching",       // watching | finished | abandoned
    percent: percent ?? 0,              // 0-100
    updatedAt: new Date().toISOString(),
    startedAt: progress[k]?.startedAt || new Date().toISOString(),
  };

  res.json({ progress: progress[k] });
});

// ── GET ALL PROGRESS FOR USER ─────────────────────────────────
app.get("/progress/:userId", (req, res) => {
  const userProgress = Object.values(progress).filter(
    (p) => p.userId === req.params.userId
  );

  // Group by status
  const watching = userProgress.filter((p) => p.status === "watching")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const finished = userProgress.filter((p) => p.status === "finished")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const abandoned = userProgress.filter((p) => p.status === "abandoned")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json({ watching, finished, abandoned, total: userProgress.length });
});

// ── GET SINGLE MOVIE PROGRESS ─────────────────────────────────
app.get("/progress/:userId/:movieId", (req, res) => {
  const k = key(req.params.userId, req.params.movieId);
  const p = progress[k];
  if (!p) return res.json({ progress: null });
  res.json({ progress: p });
});

// ── DELETE PROGRESS ───────────────────────────────────────────
app.delete("/progress/:userId/:movieId", (req, res) => {
  const k = key(req.params.userId, req.params.movieId);
  delete progress[k];
  res.json({ success: true });
});

// ── STATS ─────────────────────────────────────────────────────
app.get("/progress/:userId/stats/summary", (req, res) => {
  const userProgress = Object.values(progress).filter(
    (p) => p.userId === req.params.userId
  );

  res.json({
    totalMovies: userProgress.length,
    watching: userProgress.filter((p) => p.status === "watching").length,
    finished: userProgress.filter((p) => p.status === "finished").length,
    abandoned: userProgress.filter((p) => p.status === "abandoned").length,
    avgCompletion: userProgress.length
      ? Math.round(userProgress.reduce((s, p) => s + p.percent, 0) / userProgress.length)
      : 0,
  });
});

app.get("/", (req, res) => res.send("Progress Service Running 🚀"));
//app.listen(3006, () => console.log("Progress service running on port 3006"));
const PORT = process.env.PORT || 3001; // use your service's port as fallback
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));