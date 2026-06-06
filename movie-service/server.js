const express = require("express");
const axios = require("axios");
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

const API_KEY = process.env.TMDB_API_KEY || "bcb9cc07b15b432a1bdbcc8c04553be6";
const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const tmdb = axios.create({
  baseURL: "http://api.themoviedb.org/3",
  timeout: 15000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    family: 4,
    keepAlive: true,
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.3",
    ciphers: "DEFAULT@SECLEVEL=0"
  })
});
// Genre name → TMDB genre ID map
const GENRE_MAP = {
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  romance: 10749,
  "sci-fi": 878,
  thriller: 53,
  animation: 16,
  documentary: 99,
  fantasy: 14,
};

// 🔥 Trending
app.get("/movies/trending", async (req, res) => {
  try {
    const response = await tmdb.get("/trending/movie/day", {
      params: { api_key: API_KEY },
    });
    res.json(response.data.results);
  } catch (err) {
    console.error("Trending Error:", err.message);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
});

// 🔍 Search
app.get("/movies/search/:name", async (req, res) => {
  try {
    const response = await tmdb.get("/search/movie", {
      params: { api_key: API_KEY, query: req.params.name },
    });
    res.json(response.data.results);
  } catch (err) {
    console.error("Search Error:", err.message);
    res.status(500).json({ error: "Failed to search movies" });
  }
});

// 🎯 By Genre
app.get("/movies/genre/:genre", async (req, res) => {
  try {
    const genreId = GENRE_MAP[req.params.genre.toLowerCase()];
    if (!genreId)
      return res.status(400).json({ error: "Unknown genre" });

    const response = await tmdb.get("/discover/movie", {
      params: {
        api_key: API_KEY,
        with_genres: genreId,
        sort_by: "popularity.desc",
      },
    });
    res.json(response.data.results);
  } catch (err) {
    console.error("Genre Error:", err.message);
    res.status(500).json({ error: "Failed to fetch genre movies" });
  }
});

// 🎬 Similar
app.get("/movies/similar/:id", async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}/similar`, {
      params: { api_key: API_KEY },
    });
    res.json(response.data.results);
  } catch (err) {
    console.error("Similar Error:", err.message);
    res.status(500).json({ error: "Failed to fetch similar movies" });
  }
});

app.get("/", (req, res) => res.send("Movie Service Running 🚀"));
// 🎬 Movie Details (runtime, overview, rating)
app.get("/movies/details/:id", async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}`, {
      params: { api_key: API_KEY },
    });
    const m = response.data;
    res.json({
      id: m.id,
      title: m.title,
      overview: m.overview,
      runtime: m.runtime, // in minutes
      rating: m.vote_average,
      releaseYear: m.release_date?.split("-")[0],
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
    });
  } catch (err) {
    console.error("Details Error:", err.message);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
});

// 🎥 Movie Trailer
app.get("/movies/trailer/:id", async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}/videos`, {
      params: { api_key: API_KEY },
    });
    const videos = response.data.results;
    // Find official YouTube trailer
    const trailer =
      videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      videos.find((v) => v.site === "YouTube") ||
      null;
    res.json({ trailer: trailer ? trailer.key : null });
  } catch (err) {
    console.error("Trailer Error:", err.message);
    res.status(500).json({ error: "Failed to fetch trailer" });
  }
});
//app.listen(3001, () => console.log("Movie service running on port 3001"));
const PORT = process.env.PORT || 3001; // use your service's port as fallback
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));