export default function EvertraceLogo({ variant = "light", size = "md" }) {
  const treeColor = variant === "dark" ? "#D8C3A5" : "#B07B34";
  const textColor = variant === "dark" ? "#D8C3A5" : "#2F2D2A";
  const w = size === "sm" ? 18 : size === "lg" ? 28 : 22;
  const h = Math.round(w * 1.18);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg viewBox="0 0 32 38" fill="none" width={w} height={h}>
        <line x1="16" y1="38" x2="16" y2="20" stroke={treeColor} strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="16" y1="30" x2="6" y2="20" stroke={treeColor} strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="16" y1="25" x2="25" y2="16" stroke={treeColor} strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="16" y1="20" x2="9" y2="10" stroke={treeColor} strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="16" y1="20" x2="23" y2="8" stroke={treeColor} strokeWidth="0.9" strokeLinecap="round"/>
        <line x1="16" y1="20" x2="13" y2="6" stroke={treeColor} strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="16" y1="20" x2="19" y2="5" stroke={treeColor} strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="16" y1="20" x2="16" y2="2" stroke={treeColor} strokeWidth="1" strokeLinecap="round"/>
        <circle cx="16" cy="2" r="1.6" fill={treeColor} opacity="0.55"/>
      </svg>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: size === "sm" ? 16 : size === "lg" ? 24 : 19,
        fontWeight: 400,
        letterSpacing: "0.15em",
        color: textColor,
        lineHeight: 1,
      }}>EVERTRACE</span>
    </div>
  );
}