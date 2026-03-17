const express = require("express");
const router = express.Router();
const { chat, chatStream } = require("../services/ai");

// ── Standard response ──
router.post("/chat", async (req, res, next) => {
  try {
    const { message, code, language, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required (string)" });
    }

    const content = await chat({ message, code, language, history });
    res.json({ content });
  } catch (err) {
    next(err);
  }
});

// ── SSE streaming response ──
router.post("/chat/stream", async (req, res) => {
  const { message, code, language, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required (string)" });
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    await chatStream({
      message,
      code,
      language,
      history,
      onChunk: (text) => {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      },
    });

    res.write("data: [DONE]\n\n");
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  res.end();
});

module.exports = router;