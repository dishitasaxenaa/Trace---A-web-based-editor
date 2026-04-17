import T from "../theme/tokens";

const LANGUAGES = ["Python", "C++", "Java", "JavaScript", "Go", "Rust"];

const Topbar = ({ language, setLanguage, onRun, running, testOpen, setTestOpen }) => (
  <header style={{ height: 48, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 }}>
    {/* Brand */}
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 4 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: `0 0 12px ${T.accent}44` }}>◈</div>
      <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: 15, color: T.textPri, letterSpacing: "-0.03em" }}>
        Tr<span style={{ color: T.accent }}>ace</span>
      </span>
    </div>

    <div style={{ width: 1, height: 20, background: T.border }} />

    {/* Test toggle */}
    <button onClick={() => setTestOpen(o => !o)} style={{
      background: testOpen ? T.accentDim : T.elevated,
      border: `1px solid ${testOpen ? T.accent + "55" : T.border}`,
      color: testOpen ? T.accent : T.textSec,
      borderRadius: 6, padding: "4px 11px",
      fontFamily: T.font, fontSize: 12, fontWeight: 600,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
      transition: "all 0.15s",
    }}>
      <span>🧪</span> Test
      <span style={{ fontSize: 9, opacity: 0.55, marginLeft: 1 }}>{testOpen ? "◀" : "▶"}</span>
    </button>

    <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background: T.elevated, border: `1px solid ${T.border}`, color: T.textPri, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: T.font, cursor: "pointer", outline: "none" }}>
      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
    </select>

    <div style={{ flex: 1 }} />

    <button onClick={onRun} disabled={running} style={{
      background: running ? T.greenDim : T.green, border: "none", borderRadius: 6,
      color: running ? T.green : "#000", fontFamily: T.font, fontWeight: 700, fontSize: 12,
      padding: "6px 18px", cursor: running ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", gap: 6,
      transition: "all 0.15s", opacity: running ? 0.7 : 1,
      boxShadow: running ? "none" : `0 0 10px ${T.green}44`,
    }}>{running ? "▶ Running…" : "▶  Run"}</button>
  </header>
);

export default Topbar