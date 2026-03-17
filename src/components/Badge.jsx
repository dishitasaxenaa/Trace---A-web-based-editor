import T from "../theme/tokens";

const Badge = ({ children, color = T.accent }) => (
  <span style={{
    fontSize: 10,
    fontFamily: T.font,
    fontWeight: 700,
    color,
    background: color + "18",
    padding: "2px 7px",
    borderRadius: 4,
    border: `1px solid ${color}33`,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }}>
    {children}
  </span>
);

export default Badge;