const express = require("express");
const router = express.Router();
const { executeCode } = require("../services/piston");

router.post("/", async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    const result = await executeCode({
      code,
      language,
      stdin
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;