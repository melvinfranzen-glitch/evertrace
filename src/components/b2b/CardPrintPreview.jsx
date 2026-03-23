import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const MOTIF_BG = {
  floral_classic: "linear-gradient(160deg,#1a0e1f 0%,#0f0a14 100%)",
  minimalist: "linear-gradient(160deg,#111 0%,#0a0a0a 100%)",
  religious: "linear-gradient(160deg,#1a1208 0%,#0f0c06 100%)",
  nature: "linear-gradient(160deg,#0a130a 0%,#070d07 100%)",
  maritime: "linear-gradient(160deg,#070e18 0%,#040b12 100%)",
  forest: "linear-gradient(160deg,#0a1208 0%,#070e06 100%)",
  handwerk: "linear-gradient(160deg,#120d08 0%,#0d0905 100%)",
};

// Minimalist SVG motifs per theme (shown when no AI image available)
function MotifSVG({ motif }) {
  const color = "#c9a96e";
  const stroke = { stroke: color, strokeWidth: 1, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };

  if (motif === "nature" || motif === "forest") {
    return (
      <svg width="80" height="100" viewBox="0 0 80 100">
        {/* bare tree */}
        <line x1="40" y1="100" x2="40" y2="50" {...stroke} />
        <line x1="40" y1="70" x2="20" y2="50" {...stroke} />
        <line x1="40" y1="60" x2="60" y2="42" {...stroke} />
        <line x1="40" y1="55" x2="25" y2="38" {...stroke} />
        <line x1="40" y1="55" x2="55" y2="35" {...stroke} />
        <line x1="40" y1="50" x2="30" y2="28" {...stroke} />
        <line x1="40" y1="50" x2="50" y2="25" {...stroke} />
        <line x1="40" y1="50" x2="40" y2="18" {...stroke} />
      </svg>
    );
  }
  if (motif === "maritime") {
    return (
      <svg width="80" height="90" viewBox="0 0 80 90">
        {/* anchor */}
        <circle cx="40" cy="20" r="8" {...stroke} />
        <line x1="40" y1="28" x2="40" y2="80" {...stroke} />
        <line x1="18" y1="45" x2="62" y2="45" {...stroke} />
        <path d="M18 45 Q10 70 20 80" {...stroke} />
        <path d="M62 45 Q70 70 60 80" {...stroke} />
        <line x1="20" y1="80" x2="30" y2="80" {...stroke} />
        <line x1="60" y1="80" x2="50" y2="80" {...stroke} />
      </svg>
    );
  }
  if (motif === "religious") {
    return (
      <svg width="60" height="90" viewBox="0 0 60 90">
        {/* cross */}
        <line x1="30" y1="10" x2="30" y2="80" {...stroke} />
        <line x1="10" y1="30" x2="50" y2="30" {...stroke} />
      </svg>
    );
  }
  if (motif === "handwerk") {
    return (
      <svg width="90" height="80" viewBox="0 0 90 80">
        {/* hammer and trowel (craftsman) */}
        <rect x="10" y="35" width="30" height="10" rx="2" {...stroke} />
        <line x1="25" y1="45" x2="25" y2="70" {...stroke} />
        <line x1="55" y1="10" x2="80" y2="35" {...stroke} strokeWidth={1.5} />
        <line x1="80" y1="35" x2="70" y2="45" {...stroke} />
        <line x1="55" y1="10" x2="45" y2="20" {...stroke} />
        <line x1="45" y1="20" x2="70" y2="45" {...stroke} />
      </svg>
    );
  }
  if (motif === "floral_classic") {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* simple flower */}
        {[0,60,120,180,240,300].map((angle, i) => (
          <ellipse key={i} cx={40 + 18 * Math.cos(angle * Math.PI / 180)} cy={40 + 18 * Math.sin(angle * Math.PI / 180)}
            rx="9" ry="14"
            transform={`rotate(${angle}, ${40 + 18 * Math.cos(angle * Math.PI / 180)}, ${40 + 18 * Math.sin(angle * Math.PI / 180)})`}
            {...stroke} opacity="0.7" />
        ))}
        <circle cx="40" cy="40" r="6" {...stroke} />
      </svg>
    );
  }
  // minimalist: single horizontal line with dot
  return (
    <svg width="80" height="40" viewBox="0 0 80 40">
      <line x1="0" y1="20" x2="35" y2="20" {...stroke} />
      <circle cx="40" cy="20" r="3" fill={color} />
      <line x1="45" y1="20" x2="80" y2="20" {...stroke} />
    </svg>
  );
}

export default function CardPrintPreview({ caseData, generatedText, motif, motifImageUrl, cardFormat, side, funeralHome }) {
  const bg = MOTIF_BG[motif] || MOTIF_BG.minimalist;
  const gold = "#B07B34";
  const name = caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Vorname Nachname";

  // Aspect ratio based on format
  const aspectMap = {
    DIN_A6_landscape: "148/105",
    DIN_lang_portrait: "99/210",
    DIN_A5_folded: "148/210",
    Leporello: "148/105",
  };
  const aspect = aspectMap[cardFormat] || "148/105";

  if (side === "front") {
    return (
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: bg, border: "1px solid rgba(176,123,52,0.2)", aspectRatio: aspect, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Motif image or SVG */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          {motifImageUrl ? (
            <img src={motifImageUrl} alt="Motiv" className="w-full h-full object-cover" />
          ) : (
            <MotifSVG motif={motif} />
          )}
        </div>

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 py-6 w-full">
          {/* Top decorative line */}
          <div className="flex items-center gap-3 mb-5">
            <div style={{ height: 1, width: 36, background: "rgba(216,195,165,0.25)" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: gold }} />
            <div style={{ height: 1, width: 36, background: "rgba(216,195,165,0.25)" }} />
          </div>

          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B07B34", opacity: 0.75, marginBottom: 12 }}>In liebevoller Erinnerung</p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 22, letterSpacing: "0.04em", color: "#F7F3ED", marginBottom: 8 }}>
            {name}
          </h2>

          {caseData && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 11, letterSpacing: "0.12em", color: "rgba(216,195,165,0.55)", marginBottom: 16 }}>
              * {fmtDate(caseData.date_of_birth)} &nbsp;·&nbsp; † {fmtDate(caseData.date_of_death)}
            </p>
          )}

          {/* Bottom line */}
          <div className="flex items-center gap-3 mt-3">
            <div style={{ height: 1, width: 36, background: "rgba(216,195,165,0.25)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(216,195,165,0.5)" }} />
            <div style={{ height: 1, width: 36, background: "rgba(216,195,165,0.25)" }} />
          </div>

          {/* Funeral home branding */}
          {funeralHome?.name && (
            <p className="text-xs mt-4 opacity-50" style={{ color: "#8a8278" }}>{funeralHome.name}</p>
          )}
        </div>
      </div>
    );
  }

  // Inside
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", aspectRatio: aspect, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="w-full text-center">
        <div className="flex items-center gap-3 justify-center mb-5">
          <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
          <div className="w-1 h-1 rounded-full" style={{ background: "#D8C3A5" }} />
          <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
        </div>

        {generatedText ? (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 16, color: "#6B6257", lineHeight: 1.9, textAlign: "center" }}>
            {generatedText}
          </p>
        ) : (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2.5 rounded-full mx-auto" style={{ background: "rgba(201,169,110,0.1)", width: `${65 + (i % 3) * 12}%` }} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 justify-center mt-5">
        <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
        <div className="w-1 h-1 rounded-full" style={{ background: "#D8C3A5" }} />
        <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
        </div>

        {/* Name repeated inside */}
        <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: "0.06em", color: "#A89A8A", marginTop: 16, textAlign: "center" }}>
          {caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : ""}
        </p>
      </div>
    </div>
  );
}