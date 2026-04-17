/**
 * executor.js  (Docker edition)
 *
 * Runs user code inside a throwaway Docker container.
 * Each container is:
 *   - network-isolated  (--network none)
 *   - memory-capped     (--memory 128m)
 *   - CPU-capped        (--cpus 0.5)
 *   - read-only FS      (--read-only) with a small /tmp tmpfs
 *   - auto-removed      (--rm)
 *   - killed on timeout (SIGKILL via `docker stop`)
 *
 * Supports: python, cpp, javascript, java, go, rust
 */

import { spawn, execSync } from "child_process";
import path   from "path";
import { v4 as uuidv4 } from "uuid";

const TIMEOUT_MS = parseInt(process.env.EXEC_TIMEOUT_MS, 10) || 10_000;

// ── Docker image map ──────────────────────────────────────────────────────────
const IMAGES = {
  python:     "python:3.12-slim",
  cpp:        "gcc:13",
  javascript: "node:20-slim",
  java:       "openjdk:21-slim",
  go:         "golang:1.22-alpine",
  rust:       "rust:1-slim",
};

// ── Run commands inside the container ────────────────────────────────────────
// Each entry: array of shell commands joined with &&
// The source file is always mounted at /code/<filename>
const RUN_COMMANDS = {
  python:     (f) => `python /code/${f}`,
  cpp:        (f) => `g++ -O2 -std=c++17 /code/${f} -o /tmp/a.out && /tmp/a.out`,
  javascript: (f) => `node /code/${f}`,
  java:       (f) => {
    // Java class name must match filename; we always write Main.java
    return `cd /code && javac ${f} && java Main`;
  },
  go:         (f) => `go run /code/${f}`,
  rust:       (f) => `rustc /code/${f} -o /tmp/a.out && /tmp/a.out`,
};

const EXTENSIONS = {
  python:     ".py",
  cpp:        ".cpp",
  javascript: ".js",
  java:       ".java",   // always Main.java so class name matches
  go:         ".go",
  rust:       ".rs",
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * runInDocker
 * @param {string} code
 * @param {string} language  - one of the keys in IMAGES
 * @param {string} stdin
 * @returns {Promise<{ output: string, error: string }>}
 */
export async function runInDocker(code, language, stdin = "") {
  const lang = language.toLowerCase();

  if (!IMAGES[lang]) {
    return { output: "", error: `Unsupported language: ${language}` };
  }

  const ext      = EXTENSIONS[lang];
  // Java: class must be "Main", so filename must be "Main.java"
  const filename = lang === "java" ? "Main.java" : `solution${ext}`;
  const image    = IMAGES[lang];
  const cmd      = RUN_COMMANDS[lang](filename);
  const name     = `trace_${uuidv4().replace(/-/g, "").slice(0, 12)}`;

  // Build docker run args
  const dockerArgs = [
    "run",
    "--rm",                         // auto-remove when done
    "--name", name,
    "--network", "none",            // no internet
    "--memory", "128m",             // RAM cap
    "--memory-swap", "128m",        // no swap
    "--cpus", "0.5",                // CPU cap
    "--read-only",                  // read-only root FS
    "--tmpfs", "/tmp:size=32m",     // writable /tmp for compile output
    "--tmpfs", "/code:size=16m",    // writable /code so we can write the file
    image,
    "sh", "-c",
    // Write the code into the container then run it
    `echo ${shellEscape(code)} > /code/${filename} && ${cmd}`,
  ];

  return new Promise((resolve) => {
    let stdout   = "";
    let stderr   = "";
    let timedOut = false;

    const child = spawn("docker", dockerArgs);

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      timedOut = true;
      // Kill the container (docker stop sends SIGTERM then SIGKILL)
      try { execSync(`docker kill ${name} 2>/dev/null || true`); } catch {}
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.on("close", () => {
      clearTimeout(timer);

      if (timedOut) {
        return resolve({
          output: stdout.trim(),
          error:  `Time limit exceeded (${TIMEOUT_MS / 1000}s). Check for infinite loops.`,
        });
      }

      resolve({
        output: stdout.trim(),
        error:  stderr.trim(),
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      const msg = err.code === "ENOENT"
        ? "Docker is not installed or not in PATH."
        : `Failed to start Docker: ${err.message}`;
      resolve({ output: "", error: msg });
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * shellEscape
 * Safely wraps arbitrary code for passing to `sh -c "echo ESCAPED > file"`.
 * We use printf + hex encoding to avoid any quoting issues.
 */
function shellEscape(code) {
  // Convert each character to its hex representation, then use printf
  // Actually simpler: base64 encode and decode inside the container
  const b64 = Buffer.from(code).toString("base64");
  return `$(echo ${b64} | base64 -d)`;
}