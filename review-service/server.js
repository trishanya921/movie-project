const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let reviews = [];

// Add review
app.post("/reviews", (req, res) => {
  const { movieId, userId, userName, rating, comment } = req.body;
  if (!movieId || !comment)
    return res.status(400).json({ error: "movieId and comment required" });

  const review = {
    id: Date.now().toString(),
    movieId,
    userId,
    userName: userName || "Anonymous",
    rating: rating || 5,
    comment,
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);
  res.json({ message: "Review added", review });
});

// Get reviews by movie
app.get("/reviews/:movieId", (req, res) => {
  const movieReviews = reviews.filter(
    (r) => r.movieId == req.params.movieId
  );
  res.json(movieReviews);
});

app.get("/", (req, res) => res.send("Review Service Running 🚀"));

app.listen(3004, () => console.log("Review service running on port 3004"));