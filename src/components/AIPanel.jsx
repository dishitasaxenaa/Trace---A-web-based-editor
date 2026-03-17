import { useState, useEffect, useCallback, useRef } from "react";
import T from "../theme/tokens";
import Badge from "./Badge";
import { DEFAULT_AI_RESPONSE } from "../mocks/mockData";
import { sendAIMessage } from "../api";
import QuickActionButton from "./QuickActionButton";
import ChatMessage from "./ChatMessage";

const WELCOME = [{ id: 0, role: "assistant", content: DEFAULT_AI_RESPONSE }];

// ┌──────────────────────────────────────────────────────┐
// │ CHANGED: accepts `language` prop, calls real API     │
// └──────────────────────────────────────────────────────┘
const AIPanel = ({ code, language }) => {
  const [messages, setMessages] = useState(WELCOME);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const txt = text.trim();
    if (!txt || loading) return;

    const userMsg    = { id: Date.now(),     role: "user",      content: txt };
    const loadingMsg = { id: Date.now() + 1, role: "assistant", content: "", loading: true };

    setMessages((m) => [...m, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history (skip welcome + loading messages)
      const history = messages
        .filter((m) => m.id !== 0 && !m.loading)
        .map((m) => ({ role: m.role, content: m.content }));

      const { content } = await sendAIMessage({
        message: txt,
        code,
        language,
        history,
      });

      setMessages((m) =>
        m.map((msg) =>
          msg.loading ? { ...msg, content, loading: false } : msg
        )
      );
    } catch (err) {
      setMessages((m) =>
        m.map((msg) =>
          msg.loading
            ? { ...msg, content: `⚠️ Error: ${err.message}`, loading: false }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading, messages, code, language]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg, borderLeft: `1px solid ${T.border}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ height: 44, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
        <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: 13, color: T.textPri }}>AI Assistant</span>
        <div style={{ flex: 1 }} />
        <Badge color={T.purple}>Gemini</Badge>
        <button onClick={() => setMessages(WELCOME)} title="Clear chat" style={{ background: "none", border: "none", color: T.textMut, cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 4, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = T.red}
          onMouseLeave={e => e.currentTarget.style.color = T.textMut}
        >⊘</button>
      </div>

      <QuickActionButton onAction={sendMessage} disabled={loading} />

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column" }}>
        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface, flexShrink: 0, padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", transition: "border-color 0.15s" }}
          onFocusCapture={e => e.currentTarget.style.borderColor = T.accent + "66"}
          onBlurCapture={e => e.currentTarget.style.borderColor = T.border}
        >
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask anything about your code…" rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: T.textPri, fontFamily: T.font, fontSize: 12, lineHeight: 1.6, caretColor: T.accent, maxHeight: 80, overflowY: "auto" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
            background: input.trim() && !loading ? T.accent : T.accentDim, border: "none",
            borderRadius: 6, width: 30, height: 30, flexShrink: 0,
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, transition: "all 0.15s",
            color: input.trim() && !loading ? "#000" : T.textMut,
          }}>↑</button>
        </div>
        <div style={{ fontSize: 10, fontFamily: T.font, color: T.textMut, marginTop: 5, paddingLeft: 2 }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AIPanel;