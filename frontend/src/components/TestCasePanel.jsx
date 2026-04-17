import { useState } from "react";
import T from "../theme/tokens";
import Badge from "./Badge";
import SectionLabel from "./SectionLabel";

const PANEL_W = 268;

// ┌─────────────────────────────────────────────────┐
// │ CHANGED: input + setInput now come from props   │
// │ instead of local useState                       │
// └─────────────────────────────────────────────────┘
const TestCasePanel = ({ open, actualOutput, input, setInput }) => {
  const [expected, setExpected] = useState("[0, 1]");

  const actual = actualOutput?.output || "";
  const error = actualOutput?.error || "";
  const hasRun       = actualOutput !== null;
  const hasError = !!error;
  const passed = hasRun && !hasError && actual.trim() === expected.trim();
  const failed = hasRun && (hasError || actual.trim() !== expected.trim());
  const statusColor  = passed ? T.green : failed ? T.red : T.textMut;
  const statusBg     = passed ? T.greenDim : failed ? T.redDim : T.elevated;
  const statusBorder = passed ? T.green + "55" : failed ? T.red + "55" : T.border;
  const statusLabel  = passed ? "Passed" : failed ? "Failed" : "Not Run";

  const baseArea = {
    width: "100%", boxSizing: "border-box",
    background: T.elevated, border: `1px solid ${T.border}`,
    borderRadius: 6, padding: "8px 10px",
    color: T.textPri, fontFamily: T.font,
    fontSize: 12, lineHeight: 1.6, resize: "none", outline: "none",
    transition: "border-color 0.15s, background 0.15s",
  };
  console.log("PANEL RECEIVED:", actualOutput);
  const verdictArea = hasRun ? {
    background: passed ? T.greenDim : T.redDim,
    border: `1px solid ${passed ? T.green + "66" : T.red + "66"}`,
  } : {};

  return (
    <div style={{
      width: open ? PANEL_W : 0,
      minWidth: open ? PANEL_W : 0,
      overflow: "hidden",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)",
      borderRight: `1px solid ${T.border}`,
      background: T.surface,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ width: PANEL_W, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          height: 44, display: "flex", alignItems: "center",
          padding: "0 14px", gap: 8, flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontSize: 14 }}>🧪</span>
          <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: 13, color: T.textPri }}>
            Test Case
          </span>
          <div style={{ flex: 1 }} />
          {hasRun && <Badge color={statusColor}>{statusLabel}</Badge>}
        </div>

        {/* Fields */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <SectionLabel>Input</SectionLabel>
            <textarea
              rows={4} value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter test input…"
              style={baseArea}
              onFocus={e => e.target.style.borderColor = T.accent + "88"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div>
            <SectionLabel>Expected Output</SectionLabel>
            <textarea
              rows={2} value={expected}
              onChange={e => setExpected(e.target.value)}
              placeholder="Enter expected output…"
              style={baseArea}
              onFocus={e => e.target.style.borderColor = T.accent + "88"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div>
            <SectionLabel>Actual Output</SectionLabel>
            <div style={{ ...baseArea, ...verdictArea, minHeight: 48, cursor: "default" }}>
              {hasError
                ? <pre style={{ color: T.red }}>{error}</pre>
                : actual
                  ? <pre style={{ color: passed ? T.green : T.textPri }}>{actual}</pre>
                  : <span style={{ color: T.textMut }}>Run code to see output</span>
              }
            </div>
          </div>

          {hasRun && (
            <div style={{
              background: statusBg, border: `1px solid ${statusBorder}`,
              borderRadius: 8, padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 10,
              animation: "fadeIn 0.2s ease",
            }}>
              <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <span style={{ fontSize: 20 }}>{passed ? "✅" : "❌"}</span>
              <div>
                <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 12, color: statusColor }}>{statusLabel}</div>
                <div style={{ fontFamily: T.font, fontSize: 11, color: T.textSec, marginTop: 2 }}>
                  {passed ? "Output matches expected" : "Output does not match expected"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCasePanel;