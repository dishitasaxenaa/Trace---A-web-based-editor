/**
 * fileManager.js
 * Responsible for:
 *   - Writing user code to a uniquely-named temp file
 *   - Deleting those files after execution
 *
 * Each execution gets its own UUID-based filename so concurrent
 * requests never overwrite each other.
 *
 * Returned filePaths shape:
 * {
 *   source: "/abs/path/temp/<uuid>.py"  ← always present
 *   binary: "/abs/path/temp/<uuid>.out" ← only for C++, null for Python
 * }
 */

import fs   from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// Resolve temp/ relative to this file, regardless of where the server is started
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR  = path.resolve(__dirname, "../../temp");

// Make sure temp/ exists before the first request arrives
await fs.mkdir(TEMP_DIR, { recursive: true });

const EXTENSION = {
  python: ".py",
  cpp:    ".cpp",
};

/**
 * saveCode
 * Writes `code` to a temp file and returns the paths needed for execution.
 *
 * @param {string} code     - Raw source code from the request
 * @param {string} language - "python" | "cpp"
 * @returns {Promise<{ source: string, binary: string | null }>}
 */
export async function saveCode(code, language) {
  const id         = uuidv4();                        // e.g. "a3f2c1d4-..."
  const ext        = EXTENSION[language];
  const sourcePath = path.join(TEMP_DIR, `${id}${ext}`);
  const binaryPath = language === "cpp"
    ? path.join(TEMP_DIR, `${id}.out`)
    : null;

  await fs.writeFile(sourcePath, code, "utf8");

  return { source: sourcePath, binary: binaryPath };
}

/**
 * cleanup
 * Deletes the source file and binary (if any).
 * Silently ignores ENOENT — file already gone is not an error.
 *
 * @param {{ source: string, binary: string | null }} filePaths
 */
export async function cleanup({ source, binary }) {
  const files = [source, binary].filter(Boolean); // remove null

  await Promise.all(
    files.map((filePath) =>
      fs.unlink(filePath).catch((err) => {
        if (err.code !== "ENOENT") {
          // Log unexpected errors but don't crash
          console.warn(`[cleanup] Could not delete ${filePath}:`, err.message);
        }
      })
    )
  );
}