import T from "../theme/tokens";

const QUICK_ACTIONS = [
  {
    label: "Explain Code",
    icon: "💡",
    prompt:
      "Explain this code step-by-step. Keep it simple and structured so a beginner can follow along.",
  },
  {
    label: "Time & Space",
    icon: "📊",
    prompt:
      "Analyze the time and space complexity of this code. Cover best, average, and worst cases where applicable.",
  },
  {
    label: "Get Hints",
    icon: "🎯",
    prompt:
      "Give me hints to improve or fix this code. Do NOT give the full solution — just guide me with hints and the right thought process.",
  },
  {
    label: "Ask Anything",
    icon: "💬",
    prompt: "I have a general question about this code: ",
  },
];

const QuickActionButton = ({ onAction, disabled }) => (
  <div
    style={{
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      padding: "10px 12px",
      borderBottom: `1px solid ${T.border}`,
      background: T.surface,
    }}
  >
    {QUICK_ACTIONS.map((a) => (
      <button
        key={a.label}
        onClick={() => onAction(a.prompt)}
        disabled={disabled}
        title={a.prompt}
        style={{
          background: T.elevated,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: "4px 9px",
          color: T.textSec,
          fontFamily: T.font,
          fontSize: 11,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = T.accent + "66";
            e.currentTarget.style.color = T.accent;
            e.currentTarget.style.background = T.accentDim;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.textSec;
          e.currentTarget.style.background = T.elevated;
        }}
      >
        <span>{a.icon}</span>
        {a.label}
      </button>
    ))}
  </div>
);

export default QuickActionButton;