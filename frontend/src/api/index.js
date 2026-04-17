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

// ── AI Chat (SSE streaming) ──
export async function streamAIMessage({ message, code, language, history, onChunk, onDone }) {
  const res = await fetch(`${API_BASE}/api/ai/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, code, language, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI stream failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") {
        onDone?.();
        return;
      }
      try {
        const { content, error } = JSON.parse(payload);
        if (error) throw new Error(error);
        if (content) onChunk(content);
      } catch (e) {
        if (e.message !== "Unexpected end of JSON input") throw e;
      }
    }
  }

  onDone?.();
}