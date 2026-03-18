import { saveCode, cleanup } from "../utils/fileManager.js";
import { executeCode }       from "../utils/executor.js";
import { isSafe }            from "../utils/codeGuard.js";

const SUPPORTED_LANGUAGES = ["python", "cpp"];

export async function runCode(req, res) {
  const { language, code, stdin = "" } = req.body;

  // ── 1. Validate request fields ─────────────────────────────────────────────
  if (!language || !code) {
    return res.status(400).json({
      output: "",
      error:  'Request must include both "language" and "code" fields.',
    });
  }

  const lang = String(language).trim().toLowerCase();

  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return res.status(400).json({
      output: "",
      error:  `Unsupported language: "${language}". Supported: python, cpp.`,
    });
  }

  if (typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({
      output: "",
      error:  "Code must be a non-empty string.",
    });
  }

  // ── 2. Run code through the safety filter ──────────────────────────────────
  const guard = isSafe(code, lang);
  if (!guard.safe) {
    return res.status(400).json({
      output: "",
      error:  `Blocked: ${guard.reason}`,
    });
  }

  // ── 3. Save → Execute → Cleanup ───────────────────────────────────────────
  // filePaths is always cleaned up in the finally block, even if execution throws
  let filePaths = null;

  try {
    filePaths = await saveCode(code, lang);       // write to temp/
    const result = await executeCode(filePaths, lang, stdin); // run it
    return res.json(result);                      // { output, error }
  } catch (err) {
    console.error("[runCode] unexpected error:", err.message);
    return res.status(500).json({ output: "", error: "Execution service failed." });
  } finally {
    if (filePaths) {
      await cleanup(filePaths); // always delete temp files
    }
  }
}