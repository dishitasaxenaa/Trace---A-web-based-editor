const axios = require("axios");
const { LANGUAGE_MAP, STATUS_MAP } = require("../config/languages");

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = JUDGE0_HOST;
  }
  return headers;
}

// ── Primary: synchronous submission (wait=true) ──
async function submitAndWait({ code, language, stdin = "" }) {
  const languageId = LANGUAGE_MAP[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const headers = buildHeaders();

  const { data } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id: languageId,
      stdin,
    },
    { headers, timeout: 30000 }
  );

  return formatResult(data);
}

// ── Fallback: submit → poll until done ──
async function submitAndPoll({ code, language, stdin = "" }) {
  const languageId = LANGUAGE_MAP[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const headers = buildHeaders();

  // 1. Submit
  const { data: submission } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false`,
    {
      source_code: code,
      language_id: languageId,
      stdin,
    },
    { headers }
  );

  const token = submission.token;

  // 2. Poll (max 30 attempts × 1s = 30s)
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const { data } = await axios.get(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
      { headers }
    );
    // Status > 2 means finished (no longer queued/processing)
    if (data.status?.id > 2) return formatResult(data);
  }

  throw new Error("Execution timed out after 30 seconds");
}

// ── Format Judge0 response → frontend shape ──
function formatResult(data) {
  const statusId = data.status?.id || 13;
  return {
    stdout: data.stdout || "",
    stderr: data.stderr || data.compile_output || "",
    time: data.time ? `${data.time}s` : "0.000s",
    memory: data.memory ? `${(data.memory / 1024).toFixed(1)} MB` : "0.0 MB",
    status: STATUS_MAP[statusId] || "Unknown",
  };
}

// ── Exported function: tries wait=true, falls back to polling ──
async function executeCode(params) {
  try {
    return await submitAndWait(params);
  } catch (err) {
    // If wait=true not supported or timed out, try polling
    if (err.code === "ECONNABORTED" || err.response?.status === 408) {
      console.log("wait=true timed out, falling back to polling…");
      return await submitAndPoll(params);
    }
    throw err;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { executeCode };