import T from "../theme/tokens";

const QUICK_ACTIONS = [
  { label: "Explain Code", icon: "💡" },
  { label: "Analyze Complexity", icon: "📊" },
  { label: "Optimize", icon: "⚡" },
  { label: "Get Hints", icon: "🎯" },
];

const QuickActionButton = ({ onAction, disabled }) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "10px 12px", borderBottom: `1px solid ${T.border}`, background: T.surface }}>
    {QUICK_ACTIONS.map(a => (
      <button key={a.label} onClick={() => onAction(a.label)} disabled={disabled} style={{
        background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6,
        padding: "4px 9px", color: T.textSec, fontFamily: T.font, fontSize: 11, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4,
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = T.accent + "66"; e.currentTarget.style.color = T.accent; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}
      ><span>{a.icon}</span>{a.label}</button>
    ))}
  </div>
);

export default QuickActionButton