/**
 * executor.js
 * Runs user code locally using Node's child_process.spawn.
 *
 * Python  → python3 <file.py>
 * C++     → g++ <file.cpp> -o <file.out>  then  ./<file.out>
 *
 * Every spawned process is subject to a hard timeout (EXEC_TIMEOUT_MS).
 * If the process hasn't exited by then, it is killed with SIGKILL.
 *
 * Return shape for all functions:
 *   { output: string, error: string }
 */

import { spawn } from "child_process";

// Timeout in ms — read from .env, default to 5 seconds
const TIMEOUT_MS = parseInt(process.env.EXEC_TIMEOUT_MS, 10) || 5000;

const PYTHON_CMD = process.env.PYTHON_CMD || "python";
// ── Public API ────────────────────────────────────────────────────────────────

/**
 * executeCode
 * Entry point — dispatches to the correct language handler.
 *
 * @param {{ source: string, binary: string|null }} filePaths
 * @param {"python"|"cpp"} language
 * @returns {Promise<{ output: string, error: string }>}
 */
export async function executeCode(filePaths, language, stdin = "") {
  if (language === "python") {
    return runProcess(PYTHON_CMD, [filePaths.source], stdin);
  }

  if (language === "cpp") {
    return runCpp(filePaths.source, filePaths.binary, stdin);
  }

  throw new Error(`No executor defined for language: ${language}`);
}

// ── Language-specific runners ─────────────────────────────────────────────────

/**
 * runCpp
 * Step 1: compile with g++
 * Step 2: if compilation succeeds, run the binary
 * Step 3: if compilation fails, return the compile errors immediately
 */
async function runCpp(sourcePath, binaryPath, stdin) {
  const compileResult = await runProcess("g++", [
    sourcePath,
    "-o", binaryPath,
    "-std=c++17",
    "-O2",
  ]);

  if (compileResult.error) {
    return {
      output: "",
      error: cleanCompileError(compileResult.error, sourcePath),
    };
  }

  return runProcess(binaryPath, [], stdin);
}

// ── Core process spawner ──────────────────────────────────────────────────────

/**
 * runProcess
 * Spawns `command` with `args`, collects stdout/stderr, enforces timeout.
 *
 * @param {string}   command  - e.g. "python3" or "/tmp/abc.out"
 * @param {string[]} args     - argument list
 * @returns {Promise<{ output: string, error: string }>}
 */
function runProcess(command, args, stdin = "") {
  return new Promise((resolve) => {
    const child = spawn(command, args);
 
    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    let stdout   = "";
    let stderr   = "";
    let timedOut = false;

    // Accumulate output chunks as they arrive
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    // ── Timeout guard ─────────────────────────────────────────────────────────
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL"); // force-kill; SIGTERM may be ignored
    }, TIMEOUT_MS);

    // ── Process exit ──────────────────────────────────────────────────────────
    child.on("close", () => {
      clearTimeout(timer);

      if (timedOut) {
        return resolve({
          output: stdout?.trim() || "",
          error:  `Time limit exceeded (${TIMEOUT_MS / 1000}s). Check for infinite loops.`,
        });
      }

      resolve({
        output: stdout?.trim() || "",
        error: stderr?.trim() || ""
      });
    });

    // ── Spawn failure (e.g. command not found) ────────────────────────────────
    child.on("error", (err) => {
      clearTimeout(timer);

      // "ENOENT" means the command itself wasn't found on the system
      const message = err.code === "ENOENT"
        ? `Command not found: "${command}". Is it installed?`
        : `Failed to start process: ${err.message}`;

      resolve({ output: "", error: message });
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * cleanCompileError
 * g++ prefixes every error line with the full absolute temp path, which
 * is confusing for users who didn't write a file path. Replace it with
 * a simple "line X:" prefix so errors are readable.
 *
 * Before: /home/.../temp/a3f2c1d4.cpp:5:3: error: ...
 * After:  line 5:3: error: ...
 */
function cleanCompileError(raw, sourcePath) {
  // Escape the path so it's safe to use in a RegExp
  const escaped = sourcePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(escaped + ":", "g");

  return raw
    .replace(pattern, "line ")
    .trim();
}