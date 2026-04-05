import EvertraceSvgTree from "./EvertraceSvgTree";

export default function EvertraceLogo({ variant = "light", size = "md" }) {
  const treeColor = variant === "dark" ? "#D8C3A5" : "#B07B34";
  const textColor = variant === "dark" ? "#D8C3A5" : "#2F2D2A";
  const w = size === "sm" ? 18 : size === "lg" ? 28 : 22;
  const h = Math.round(w * 1.18);
  const svgSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <EvertraceSvgTree size={svgSize} />
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