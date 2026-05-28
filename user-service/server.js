const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "movieflix_secret_key";

// In-memory store (replace with MongoDB in production)
let users = [];

// ✅ Register
app.post("/users/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
const displayName = name || username; // accept both

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = users.find((u) => u.email === email);
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      genres: [], // saved after genre selection step
    };

    users.push(user);

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, genres: [] },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ Login
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        genres: user.genres,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Save genres (called after genre selection step)
app.post("/users/:id/genres", (req, res) => {
  try {
    const { genres } = req.body;
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.genres = genres;
    res.json({ message: "Genres saved", genres: user.genres });
  } catch (err) {
    res.status(500).json({ error: "Failed to save genres" });
  }
});

// ✅ Get user
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.get("/", (req, res) => res.send("User Service Running 🚀"));

app.listen(3002, () => console.log("User service running on port 3002"));