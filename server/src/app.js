import "dotenv/config";
import express from "express";
import cors    from "cors";
import runRouter from "./routes/run.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "256kb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", runRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Catches anything thrown by route handlers that wasn't handled locally
app.use((err, _req, res, _next) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ output: "", error: "Internal server error." });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Trace runner listening → http://localhost:${PORT}`);
});