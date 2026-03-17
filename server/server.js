require("dotenv").config();
const express = require("express");
const cors = require("cors");

const executeRoutes = require("./routes/execute");
const aiRoutes = require("./routes/ai");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use("/api/execute", executeRoutes);
app.use("/api/ai", aiRoutes);

// ── Error handler (must be last) ──
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  ◈ Trace backend running → http://localhost:${PORT}`);
  console.log(`  ◈ Health check          → http://localhost:${PORT}/api/health\n`);
});