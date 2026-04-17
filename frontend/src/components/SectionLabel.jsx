import T from "../theme/tokens";

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 10,
    fontFamily: T.font,
    fontWeight: 700,
    color: T.textMut,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  }}>
    {children}
  </div>
);

export default SectionLabel;