import T from "../theme/tokens";

const OutputPanel = ({ output, onClose }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", animation: "slideUp 0.18s ease" }}>
    <style>{`@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    <div style={{ height: 36, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 10, flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontFamily: T.font, color: T.textSec, fontWeight: 700 }}>Console Output</span>
      <span style={{ fontSize: 10, fontFamily: T.font, fontWeight: 700, color: output.stderr ? T.red : T.green, background: (output.stderr ? T.red : T.green) + "18", padding: "2px 7px", borderRadius: 4, border: `1px solid ${(output.stderr ? T.red : T.green)}33`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{output.status}</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, fontFamily: T.font, color: T.textMut }}>⏱ {output.time}</span>
      <span style={{ fontSize: 11, fontFamily: T.font, color: T.textMut }}>⬛ {output.memory}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMut, cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 4, transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = T.red}
        onMouseLeave={e => e.currentTarget.style.color = T.textMut}
      >✕</button>
    </div>
    <div style={{ flex: 1, padding: "12px 14px", overflowY: "auto" }}>
      {output.stdout && <>
        <div style={{ fontSize: 10, fontFamily: T.font, color: T.textMut, marginBottom: 5, letterSpacing: "0.08em" }}>STDOUT</div>
        <pre style={{ margin: 0, padding: "10px 14px", background: T.elevated, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.green, lineHeight: 1.6 }}>{output.stdout}</pre>
      </>}
      {output.stderr && <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, fontFamily: T.font, color: T.red, marginBottom: 5, letterSpacing: "0.08em" }}>STDERR</div>
        <pre style={{ margin: 0, padding: "10px 14px", background: T.redDim, borderRadius: 6, border: `1px solid ${T.red}44`, fontSize: 13, fontFamily: T.font, color: T.red, lineHeight: 1.6 }}>{output.stderr}</pre>
      </div>}
    </div>
  </div>
);

export default OutputPanel;