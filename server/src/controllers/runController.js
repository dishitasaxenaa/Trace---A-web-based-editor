import { isSafe }       from "../utils/codeGuard.js";
import { runInDocker }  from "../utils/executor.js";

const SUPPORTED_LANGUAGES = ["python", "cpp", "javascript", "java", "go", "rust"];

export async function runCode(req, res) {
  const { language, code, stdin = "" } = req.body;

  // ── 1. Validate ────────────────────────────────────────────────────────────
  if (!language || !code) {
    return res.status(400).json({
      output: "",
      error: 'Request must include both "language" and "code" fields.',
    });
  }

  const lang = String(language).trim().toLowerCase();

  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return res.status(400).json({
      output: "",
      error: `Unsupported language: "${language}". Supported: ${SUPPORTED_LANGUAGES.join(", ")}.`,
    });
  }

  if (typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({
      output: "",
      error: "Code must be a non-empty string.",
    });
  }

  // ── 2. Safety filter (still useful as a fast pre-check) ───────────────────
  // Only run guard for languages that have rules; others rely on Docker isolation
  const guard = isSafe(code, lang);
  if (!guard.safe) {
    return res.status(400).json({
      output: "",
      error: `Blocked: ${guard.reason}`,
    });
  }

  // ── 3. Run in Docker ───────────────────────────────────────────────────────
  try {
    const result = await runInDocker(code, lang, stdin);
    return res.json(result);
  } catch (err) {
    console.error("[runCode] unexpected error:", err.message);
    return res.status(500).json({ output: "", error: "Execution service failed." });
  }
}