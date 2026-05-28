const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());




const SERVICES = {
  movies:    "http://movie-service:3001",
  users:     "http://user-service:3002",
  recommend: "http://recommendation-service:3003",
  reviews:   "http://review-service:3004",
  group:     "http://group-service:3005",
  progress:  "http://progress-service:3006",
  rewatch:   "http://rewatch-service:3007"
}

// ─── USER ROUTES ─────────────────────────────────────────────
app.post("/api/users/register", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.users}/users/register`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "User service unavailable" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.users}/users/login`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "User service unavailable" });
  }
});

app.post("/api/users/:id/genres", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.users}/users/${req.params.id}/genres`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "User service unavailable" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.users}/users/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "User service unavailable" });
  }
});

// ─── MOVIE ROUTES ─────────────────────────────────────────────
app.get("/api/movies/trending", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.movies}/movies/trending`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Movie service unavailable" });
  }
});

app.get("/api/movies/search/:name", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.movies}/movies/search/${req.params.name}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Movie service unavailable" });
  }
});

app.get("/api/movies/genre/:genre", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.movies}/movies/genre/${req.params.genre}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Movie service unavailable" });
  }
});

// ─── RECOMMENDATION ROUTES ────────────────────────────────────
app.post("/api/recommend", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.recommend}/recommend`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Recommendation service unavailable" });
  }
});

// ─── REVIEW ROUTES ────────────────────────────────────────────
app.get("/api/reviews/:movieId", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.reviews}/reviews/${req.params.movieId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Review service unavailable" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.reviews}/reviews`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Review service unavailable" });
  }
});
// ─── ADD THESE TO YOUR EXISTING gateway/server.js ───────────────

// Add these 3 lines to your SERVICES object:
// group:    "http://group-service:3005",
// progress: "http://progress-service:3006",
// rewatch:  "http://rewatch-service:3007",

// ─── GROUP ROUTES ─────────────────────────────────────────────
app.post("/api/groups/create", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.group}/groups/create`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Group service unavailable" });
  }
});

app.post("/api/groups/join", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.group}/groups/join`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Group service unavailable" });
  }
});

app.get("/api/groups/:code", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.group}/groups/${req.params.code}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Group service unavailable" });
  }
});

app.get("/api/groups/:code/recommend", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.group}/groups/${req.params.code}/recommend`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Group service unavailable" });
  }
});

app.post("/api/groups/:code/leave", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.group}/groups/${req.params.code}/leave`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Group service unavailable" });
  }
});

// ─── PROGRESS ROUTES ──────────────────────────────────────────
app.post("/api/progress", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.progress}/progress`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Progress service unavailable" });
  }
});

app.get("/api/progress/:userId", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.progress}/progress/${req.params.userId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Progress service unavailable" });
  }
});

app.get("/api/progress/:userId/:movieId", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.progress}/progress/${req.params.userId}/${req.params.movieId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Progress service unavailable" });
  }
});

app.get("/api/progress/:userId/stats/summary", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.progress}/progress/${req.params.userId}/stats/summary`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Progress service unavailable" });
  }
});

app.delete("/api/progress/:userId/:movieId", async (req, res) => {
  try {
    const r = await axios.delete(`${SERVICES.progress}/progress/${req.params.userId}/${req.params.movieId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Progress service unavailable" });
  }
});

// ─── REWATCH ROUTES ───────────────────────────────────────────
app.post("/api/rewatch/vote", async (req, res) => {
  try {
    const r = await axios.post(`${SERVICES.rewatch}/rewatch/vote`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Rewatch service unavailable" });
  }
});

app.get("/api/rewatch/top/all", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.rewatch}/rewatch/top/all`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Rewatch service unavailable" });
  }
});

app.get("/api/rewatch/:movieId", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.rewatch}/rewatch/${req.params.movieId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Rewatch service unavailable" });
  }
});

app.get("/api/rewatch/:movieId/user/:userId", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.rewatch}/rewatch/${req.params.movieId}/user/${req.params.userId}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Rewatch service unavailable" });
  }
});

// ─── HEALTH ───────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));
// Movie details
app.get("/api/movies/details/:id", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.movies}/movies/details/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Movie service unavailable" });
  }
});

// Movie trailer
app.get("/api/movies/trailer/:id", async (req, res) => {
  try {
    const r = await axios.get(`${SERVICES.movies}/movies/trailer/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(502).json({ error: "Movie service unavailable" });
  }
});
app.listen(3000, () => console.log("API Gateway running on port 3000"));