/**
 * codeGuard.js
 * Static pattern analysis — rejects obviously dangerous code before
 * it ever touches the filesystem.
 *
 * This is NOT a full sandbox. For production, use Docker or gVisor.
 * This layer is a cheap first filter that stops the most common abuse.
 *
 * Usage:
 *   const result = isSafe(code, "python");
 *   // result → { safe: true, reason: null }
 *   // result → { safe: false, reason: "Shell access is not allowed" }
 */

// ── Rule sets per language ────────────────────────────────────────────────────

const PYTHON_RULES = [
  {
    // subprocess, os.system, os.popen — shell execution
    pattern: /\b(subprocess|os\.system|os\.popen|commands)\b/,
    reason:  "Shell/subprocess access is not allowed",
  },
  {
    // exec() and eval() allow arbitrary code execution
    pattern: /\b(exec|eval)\s*\(/,
    reason:  "exec() and eval() are not allowed",
  },
  {
    // compile() can also be used to run dynamic code
    pattern: /\bcompile\s*\(/,
    reason:  "compile() is not allowed",
  },
  {
    // __import__ is an alternate way to import modules dynamically
    pattern: /__import__\s*\(/,
    reason:  "Dynamic imports via __import__ are not allowed",
  },
  {
    // open() in write/append mode — prevent file system writes
    pattern: /\bopen\s*\(.*?['"](w|a|wb|ab|w\+|a\+)['"]/,
    reason:  "Writing to files is not allowed",
  },
  {
    // Network access
    pattern: /\b(socket|urllib|requests|httpx|aiohttp|pycurl)\b/,
    reason:  "Network access is not allowed",
  },
  {
    // shutil — file system manipulation (copy, move, delete)
    pattern: /\bshutil\b/,
    reason:  "File system manipulation (shutil) is not allowed",
  },
  {
    // ctypes — can call native libraries and system functions
    pattern: /\bctypes\b/,
    reason:  "ctypes is not allowed",
  },
];

const CPP_RULES = [
  {
    // system() — runs shell commands
    pattern: /\bsystem\s*\(/,
    reason:  "system() calls are not allowed",
  },
  {
    // popen — runs shell commands and reads output
    pattern: /\bpopen\s*\(/,
    reason:  "popen() is not allowed",
  },
  {
    // exec family — replaces current process image with another program
    pattern: /\b(execl|execv|execvp|execlp|execle|execve)\s*\(/,
    reason:  "exec() family calls are not allowed",
  },
  {
    // fork — create child processes
    pattern: /\bfork\s*\(\s*\)/,
    reason:  "fork() is not allowed",
  },
  {
    // socket — network access
    pattern: /\bsocket\s*\(/,
    reason:  "Network socket access is not allowed",
  },
  {
    // fopen in write/append mode
    pattern: /\bfopen\s*\(.*?['"](w|a|wb|ab)['"]/,
    reason:  "Writing to files is not allowed",
  },
  {
    // Including network or system-level headers
    pattern: /#include\s*[<"](sys\/socket|netinet\/|arpa\/inet|unistd\.h)[>"]/,
    reason:  "Network/system headers are not allowed",
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * isSafe
 * Checks code against the rule set for the given language.
 * Returns on the first matching (blocked) rule.
 *
 * @param {string} code
 * @param {"python"|"cpp"} language
 * @returns {{ safe: boolean, reason: string | null }}
 */
export function isSafe(code, language) {
  const rules = language === "python" ? PYTHON_RULES
              : language === "cpp"    ? CPP_RULES
              : [];

  for (const rule of rules) {
    if (rule.pattern.test(code)) {
      return { safe: false, reason: rule.reason };
    }
  }

  // Reject unreasonably large payloads (50 KB is plenty for a snippet)
  if (code.length > 50_000) {
    return { safe: false, reason: "Code exceeds the 50 KB size limit" };
  }

  return { safe: true, reason: null };
}