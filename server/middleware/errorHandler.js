module.exports = (err, _req, res, _next) => {
  console.error("── Error ──");
  console.error(err.message);
  if (err.response?.data) console.error("External:", err.response.data);

  // Axios error (Judge0 / Anthropic HTTP failures)
  if (err.response) {
    return res.status(err.response.status || 502).json({
      error: "External service error",
      details: err.response.data?.message || err.response.data?.error || err.message,
    });
  }

  // Anthropic SDK error
  if (err.status && err.type) {
    return res.status(err.status).json({
      error: `AI error: ${err.type}`,
      details: err.message,
    });
  }

  // Generic
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};