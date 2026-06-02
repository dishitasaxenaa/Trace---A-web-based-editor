const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Code Execution ──
export async function executeCode({ code, language, stdin }) {
  const res = await fetch(`${API_BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, stdin }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Execution failed (${res.status})`);
  }

  return res.json();
}

// ── AI Chat (standard) ──
export async function sendAIMessage({ message, code, language, history }) {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, code, language, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI request failed (${res.status})`);
  }

  return res.json();
}
