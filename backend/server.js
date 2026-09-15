require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();

connectDB();

app.use(cors()); // allows the React frontend (different port) to call this API
app.use(express.json()); // parses JSON request bodies

// Simple request logger so you can see every incoming request in the terminal
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/audit", auditRoutes);

// Catch-all error handler - keeps the server from crashing on unexpected errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
