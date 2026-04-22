import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2 } from "lucide-react";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd. MMMM yyyy", { locale: de }); }
  catch { return d; }
}

// Each design style defines colors and decorative elements rendered in HTML
const STYLE_CONFIGS = {
  classic_dark: {
    bg: "linear-gradient(160deg, #1a1714 0%, #120f0c 100%)",
    accent: "#c9a96e",
    textColor: "#f0ede8",
    subColor: "rgba(240,237,232,0.55)",
    dividerStyle: "ornamental", // top/bottom gold lines + dots
  },
  nature_warm: {
    bg: "linear-gradient(160deg, #111a0e 0%, #0a1208 100%)",
    accent: "#8faf6a",
    textColor: "#e8f0e0",
    subColor: "rgba(232,240,224,0.55)",
    dividerStyle: "leaf",
  },
  minimal_modern: {
    bg: "linear-gradient(180deg, #0f0e0c 0%, #161412 100%)",
    accent: "#a0927e",
    textColor: "#f5f2ee",
    subColor: "rgba(245,242,238,0.5)",
    dividerStyle: "thin_line",
  },
  spiritual_soft: {
    bg: "radial-gradient(ellipse at 50% 30%, #131b2e 0%, #0b0d14 60%, #080a0f 100%)",
    accent: "#c8d4f0",
    textColor: "#e8edf8",
    subColor: "rgba(232,237,248,0.55)",
    dividerStyle: "glow_dots",
  },
};

function OrnamentalDivider({ style, color }) {
  if (style === "ornamental") {
    return (
      <div className="flex items-center justify-center gap-2" style={{ margin: "10px 0" }}>
        <div style={{ height: 1, width: 28, background: `${color}55` }} />
        <div style={{ width: 3, height: 3, borderRadius: "50%", background: color }} />
        <div style={{ width: 5, height: 5, borderRadius: "50%", border: `1px solid ${color}`, background: "transparent" }} />
        <div style={{ width: 3, height: 3, borderRadius: "50%", background: color }} />
        <div style={{ height: 1, width: 28, background: `${color}55` }} />
      </div>
    );
  }
  if (style === "leaf") {
    return (
      <div className="flex items-center justify-center gap-2" style={{ margin: "10px 0" }}>
        <div style={{ height: 1, width: 24, background: `${color}60` }} />
        <span style={{ color, fontSize: 10, opacity: 0.8 }}>✦</span>
        <div style={{ height: 1, width: 24, background: `${color}60` }} />
      </div>
    );
  }
  if (style === "thin_line") {
    return (
      <div style={{ height: 1, width: "40%", margin: "12px auto", background: `${color}40` }} />
    );
  }
  if (style === "glow_dots") {
    return (
      <div className="flex items-center justify-center gap-1.5" style={{ margin: "10px 0" }}>
        {[0.3, 0.7, 1, 0.7, 0.3].map((op, i) => (
          <div key={i} style={{ width: i === 2 ? 5 : 3, height: i === 2 ? 5 : 3, borderRadius: "50%", background: color, opacity: op }} />
        ))}
      </div>
    );
  }
  return null;
}

export default function CardDesignPreview({ design, caseData, text, funeralHome, isSelected, isLoading, onClick, onRegenerate, showRegenerateButton }) {
  const cfg = STYLE_CONFIGS[design?.style] || STYLE_CONFIGS.classic_dark;
  const name = caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Vorname Nachname";
  const born = caseData?.date_of_birth ? fmtDate(caseData.date_of_birth) : null;
  const died = caseData?.date_of_death ? fmtDate(caseData.date_of_death) : null;
  const birthPlace = caseData?.birth_place || null;
  const deathPlace = caseData?.death_place || null;
  const burialType = caseData?.burial_type || null;

  return (
    <div
      className="flex flex-col cursor-pointer transition-all duration-200"
      style={{ border: `2px solid ${isSelected ? cfg.accent : "#302d28"}`, borderRadius: 16, overflow: "hidden", transform: isSelected ? "scale(1.02)" : "scale(1)" }}
      onClick={onClick}
    >
      {/* The card itself — A5 portrait ratio approx 1:1.414 */}
      <div
        className="relative select-none"
        style={{
          aspectRatio: "1 / 1.414",
          background: cfg.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          overflow: "hidden",
        }}
      >
        {/* Background texture overlay for some styles */}
        {design?.style === "spiritual_soft" && (
          <div style={{
            position: "absolute", inset: 0, opacity: 0.06,
            background: "radial-gradient(ellipse at 50% 0%, white 0%, transparent 70%)",
          }} />
        )}
        {design?.style === "nature_warm" && (
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "repeating-linear-gradient(45deg, #8faf6a 0px, #8faf6a 1px, transparent 1px, transparent 8px)",
          }} />
        )}

        {/* Background motif image (if generated) */}
        {design?.bgImageUrl && (
          <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
            <img src={design.bgImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Loader2 style={{ width: 24, height: 24, color: cfg.accent, animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 11, color: cfg.subColor }}>wird generiert…</span>
          </div>
        ) : (
          <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center" }}>
            {/* Top ornament */}
            <OrnamentalDivider style={cfg.dividerStyle} color={cfg.accent} />

            {/* Tagline */}
            <p style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300,
              fontSize: 7.5, letterSpacing: "0.22em", textTransform: "uppercase",
              color: cfg.accent, marginBottom: 10, opacity: 0.85,
            }}>
              In liebevoller Erinnerung
            </p>

            {/* Name */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
              fontSize: 18, letterSpacing: "0.03em",
              color: cfg.textColor, marginBottom: 6, lineHeight: 1.2,
            }}>
              {name}
            </h2>

            {/* Dates */}
            {(born || died) && (
              <p style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 300,
                fontSize: 8.5, letterSpacing: "0.1em",
                color: cfg.subColor, marginBottom: 4,
              }}>
                {born && `* ${born}`}{born && died && "  ·  "}{died && `† ${died}`}
              </p>
            )}

            {/* Places */}
            {(birthPlace || deathPlace) && (
              <p style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 300,
                fontSize: 8, letterSpacing: "0.06em",
                color: cfg.subColor, marginBottom: 4, opacity: 0.8,
              }}>
                {birthPlace && `${birthPlace}`}{birthPlace && deathPlace && " — "}{deathPlace && `${deathPlace}`}
              </p>
            )}

            {burialType && (
              <p style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 300,
                fontSize: 7.5, letterSpacing: "0.08em",
                color: cfg.subColor, marginBottom: 2, opacity: 0.65,
              }}>
                {burialType}
              </p>
            )}

            {/* Middle divider */}
            <OrnamentalDivider style={cfg.dividerStyle} color={cfg.accent} />

            {/* Text */}
            {text && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300,
                fontSize: 9.5, lineHeight: 1.75, color: cfg.textColor,
                opacity: 0.85, margin: "0 4px",
              }}>
                {text}
              </p>
            )}

            {/* Bottom divider */}
            <OrnamentalDivider style={cfg.dividerStyle} color={cfg.accent} />

            {/* Funeral home */}
            {funeralHome?.name && (
              <p style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 300,
                fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase",
                color: cfg.subColor, opacity: 0.5, marginTop: 6,
              }}>
                {funeralHome.name}
              </p>
            )}
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 22, height: 22, borderRadius: "50%",
            background: cfg.accent, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#0f0e0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Label bar */}
      <div style={{ background: "#181714", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #302d28" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? cfg.accent : "#f0ede8" }}>
          {design?.styleLabel || "Design"}
        </span>
        {showRegenerateButton && !isLoading && (
          <button
            onClick={e => { e.stopPropagation(); onRegenerate(); }}
            style={{ background: "#302d28", border: "none", borderRadius: 6, padding: "3px 6px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
            title="Neu generieren"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8a8278" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
            <span style={{ fontSize: 9, color: "#8a8278" }}>Neu</span>
          </button>
        )}
      </div>
    </div>
  );
}