const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MOVIE_SERVICE = "http://movie-service:3001";
app.post("/recommend", async (req, res) => {
  try {
    const { genres } = req.body;

    if (!genres || genres.length === 0) {
      const response = await axios.get(`${MOVIE_SERVICE}/movies/trending`);
      return res.json(response.data);
    }

    // Fetch movies for ALL genres in parallel
    const requests = genres.map((g) =>
      axios
        .get(`${MOVIE_SERVICE}/movies/genre/${g}`)
        .then((r) => r.data)
        .catch(() => [])
    );

    const results = await Promise.all(requests);

    // Take up to 20 movies per genre BEFORE merging
    // This ensures every genre is represented equally
    const perGenre = results.map((movies) =>
      movies.slice(0, 20)
    );

    // Interleave results (take 1 from each genre in turns)
    // so no single genre dominates the top of the list
    const interleaved = [];
    const maxLen = Math.max(...perGenre.map((g) => g.length));
    for (let i = 0; i < maxLen; i++) {
      for (const genreMovies of perGenre) {
        if (genreMovies[i]) interleaved.push(genreMovies[i]);
      }
    }

    // Deduplicate by movie id (keep first occurrence)
    const seen = new Set();
    const unique = interleaved.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    // Return all results — frontend will filter by genre tab
    res.json(unique);
  } catch (err) {
    console.error("Recommendation Error:", err.message);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

app.get("/", (req, res) => res.send("Recommendation Service Running 🚀"));

app.listen(3003, () =>
  console.log("Recommendation service running on port 3003")
);
