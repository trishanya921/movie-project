const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
// groups: { [code]: { code, name, createdBy, members: [{userId, name, genres}], createdAt } }
const groups = {};

// Generate a 6-character invite code
const generateCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

// ── CREATE GROUP ──────────────────────────────────────────────
app.post("/groups/create", (req, res) => {
  const { userId, userName, genres } = req.body;
  if (!userId || !userName) return res.status(400).json({ error: "userId and userName required" });

  const code = generateCode();
  groups[code] = {
    code,
    name: `${userName}'s Group`,
    createdBy: userId,
    members: [{ userId, name: userName, genres: genres || [] }],
    createdAt: new Date().toISOString(),
  };

  res.json({ group: groups[code] });
});

// ── JOIN GROUP ────────────────────────────────────────────────
app.post("/groups/join", (req, res) => {
  const { code, userId, userName, genres } = req.body;
  if (!code || !userId || !userName) return res.status(400).json({ error: "code, userId and userName required" });

  const group = groups[code.toUpperCase()];
  if (!group) return res.status(404).json({ error: "Group not found. Check your invite code." });

  // Check if already in group
  const existing = group.members.find((m) => m.userId === userId);
  if (existing) return res.json({ group }); // already joined, just return group

  group.members.push({ userId, name: userName, genres: genres || [] });
  res.json({ group });
});

// ── GET GROUP ─────────────────────────────────────────────────
app.get("/groups/:code", (req, res) => {
  const group = groups[req.params.code.toUpperCase()];
  if (!group) return res.status(404).json({ error: "Group not found" });
  res.json({ group });
});

// ── GET GROUP RECOMMENDATIONS ─────────────────────────────────
// Finds genres that overlap across all members
app.get("/groups/:code/recommend", (req, res) => {
  const group = groups[req.params.code.toUpperCase()];
  if (!group) return res.status(404).json({ error: "Group not found" });

  if (group.members.length === 0) return res.json({ genres: [], members: 0 });

  // Count genre frequency across all members
  const genreCount = {};
  group.members.forEach((member) => {
    (member.genres || []).forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });

  // Sort genres by how many members share them
  const sorted = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count, members: group.members.length }));

  res.json({
    genres: sorted,
    members: group.members.length,
    group: group,
  });
});

// ── LEAVE GROUP ───────────────────────────────────────────────
app.post("/groups/:code/leave", (req, res) => {
  const { userId } = req.body;
  const group = groups[req.params.code.toUpperCase()];
  if (!group) return res.status(404).json({ error: "Group not found" });

  group.members = group.members.filter((m) => m.userId !== userId);
  res.json({ success: true });
});

app.get("/", (req, res) => res.send("Group Service Running 🚀"));
app.listen(3005, () => console.log("Group service running on port 3005"));