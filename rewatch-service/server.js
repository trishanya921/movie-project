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
// votes: { [movieId]: { movieId, movieTitle, poster, yes: Set, no: Set } }
const votes = {};
// userVotes: { [userId_movieId]: "yes" | "no" }
const userVotes = {};

const voteKey = (userId, movieId) => `${userId}_${movieId}`;

// ── SUBMIT VOTE ───────────────────────────────────────────────
app.post("/rewatch/vote", (req, res) => {
  const { userId, movieId, movieTitle, poster, vote } = req.body;
  if (!userId || !movieId || !vote) return res.status(400).json({ error: "userId, movieId and vote required" });
  if (!["yes", "no"].includes(vote)) return res.status(400).json({ error: "vote must be 'yes' or 'no'" });

  // Init movie entry
  if (!votes[movieId]) {
    votes[movieId] = {
      movieId,
      movieTitle: movieTitle || "Unknown",
      poster: poster || null,
      yes: new Set(),
      no: new Set(),
    };
  }

  const k = voteKey(userId, movieId);
  const prev = userVotes[k];

  // Remove previous vote if exists
  if (prev) {
    votes[movieId][prev].delete(userId);
  }

  // Add new vote
  votes[movieId][vote].add(userId);
  userVotes[k] = vote;

  const movie = votes[movieId];
  const yes = movie.yes.size;
  const no = movie.no.size;
  const total = yes + no;
  const score = total > 0 ? Math.round((yes / total) * 100) : 0;

  res.json({
    movieId,
    userVote: vote,
    yes,
    no,
    total,
    score, // % of people who would rewatch
    verdict: score >= 70 ? "Definitely Rewatch 🔥" : score >= 40 ? "Maybe Rewatch 🤔" : "Skip It ❌",
  });
});

// ── GET MOVIE REWATCH SCORE ───────────────────────────────────
app.get("/rewatch/:movieId", (req, res) => {
  const movie = votes[req.params.movieId];
  if (!movie) return res.json({ movieId: req.params.movieId, yes: 0, no: 0, total: 0, score: 0, verdict: "No votes yet" });

  const yes = movie.yes.size;
  const no = movie.no.size;
  const total = yes + no;
  const score = total > 0 ? Math.round((yes / total) * 100) : 0;

  res.json({
    movieId: movie.movieId,
    movieTitle: movie.movieTitle,
    poster: movie.poster,
    yes,
    no,
    total,
    score,
    verdict: score >= 70 ? "Definitely Rewatch 🔥" : score >= 40 ? "Maybe Rewatch 🤔" : "Skip It ❌",
  });
});

// ── GET USER VOTE FOR A MOVIE ─────────────────────────────────
app.get("/rewatch/:movieId/user/:userId", (req, res) => {
  const k = voteKey(req.params.userId, req.params.movieId);
  res.json({ vote: userVotes[k] || null });
});

// ── TOP REWATCH MOVIES ────────────────────────────────────────
app.get("/rewatch/top/all", (req, res) => {
  const results = Object.values(votes)
    .map((movie) => {
      const yes = movie.yes.size;
      const no = movie.no.size;
      const total = yes + no;
      const score = total > 0 ? Math.round((yes / total) * 100) : 0;
      return { movieId: movie.movieId, movieTitle: movie.movieTitle, poster: movie.poster, yes, no, total, score };
    })
    .filter((m) => m.total > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  res.json(results);
});

app.get("/", (req, res) => res.send("Rewatch Service Running 🚀"));
//app.listen(3007, () => console.log("Rewatch service running on port 3007"));
const PORT = process.env.PORT || 3001; // use your service's port as fallback
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));