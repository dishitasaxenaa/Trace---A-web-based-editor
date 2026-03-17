import T from "../theme/tokens";

const MdLine = ({ line, i }) => {
  const bold = s => s.split(/\*\*(.*?)\*\*/g).map((p, j) =>
    j % 2 === 1 ? <strong key={j} style={{ color: T.textPri, fontWeight: 700 }}>{p}</strong> : p
  );
  if (!line.trim()) return <div style={{ height: 6 }} />;
  if (line.startsWith("```")) return null;
  if (line.startsWith("**") && line.endsWith("**") && line.length > 4)
    return <div style={{ color: T.accent, fontWeight: 700, fontSize: 12, marginTop: i > 0 ? 10 : 0, marginBottom: 3 }}>{line.slice(2, -2)}</div>;
  if (line.match(/^\d+\./))
    return <div style={{ color: T.textSec, fontSize: 12, lineHeight: 1.7, paddingLeft: 14 }}>{bold(line)}</div>;
  if (line.startsWith("`") && line.endsWith("`") && line.length > 2)
    return <code style={{ display: "block", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 5, padding: "6px 10px", fontSize: 12, fontFamily: T.font, color: T.textPri, margin: "4px 0" }}>{line.slice(1, -1)}</code>;
  return <div style={{ color: T.textSec, fontSize: 12, lineHeight: 1.8 }}>{bold(line)}</div>;
};
const Markdown = ({ text }) => <div>{text.split("\n").map((l, i) => <MdLine key={i} line={l} i={i} />)}</div>;

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, gap: 8, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginBottom: 2 }}>✦</div>
      )}
      <div style={{ maxWidth: "78%", background: isUser ? T.accentDim : T.elevated, border: `1px solid ${isUser ? T.accent + "44" : T.border}`, borderRadius: isUser ? "12px 12px 3px 12px" : "12px 12px 12px 3px", padding: "10px 13px" }}>
        {msg.loading
          ? <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
            </div>
          : isUser
            ? <span style={{ fontSize: 12, fontFamily: T.font, color: T.textPri, lineHeight: 1.6 }}>{msg.content}</span>
            : <Markdown text={msg.content} />
        }
      </div>
      {isUser && (
        <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: T.elevated, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.textSec, marginBottom: 2 }}>U</div>
      )}
    </div>
  );
};

export default ChatMessage