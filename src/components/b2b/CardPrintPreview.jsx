import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

// ─── OUTSIDE / FRONT ───────────────────────────────────────────────────────────

function CardFront({ caseData, motifImageUrl, cardFormat, funeralHome, heroImageUrl }) {
  const name = caseData
    ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}`
    : "Vorname Nachname";
  const birth = caseData?.date_of_birth ? fmtDate(caseData.date_of_birth) : "";
  const death = caseData?.date_of_death ? fmtDate(caseData.date_of_death) : "";
  const hasPhoto = !!heroImageUrl;
  const bgImage = hasPhoto ? heroImageUrl : motifImageUrl;

  const aspectMap = {
    DIN_A6_landscape: "148/105",
    DIN_lang_portrait: "99/210",
    DIN_A5_folded: "148/210",
    Leporello: "148/105",
  };
  const aspect = aspectMap[cardFormat] || "148/210";

  return (
    <div style={{ aspectRatio: aspect, position: "relative", overflow: "hidden", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
      {/* Background Image — full bleed */}
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: hasPhoto ? "center 25%" : "center",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1a1a18, #0f0e0c)" }} />
      )}

      {/* Gradient overlay so text is always readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: hasPhoto
          ? "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.82) 100%)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.65) 100%)",
      }} />

      {/* Content — bottom aligned */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        alignItems: "center", textAlign: "center",
        padding: "0 20px 20px",
      }}>
        {/* Decorative divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ height: 1, width: 24, background: "rgba(216,195,165,0.45)" }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#B07B34" }} />
          <div style={{ height: 1, width: 24, background: "rgba(216,195,165,0.45)" }} />
        </div>

        <p style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 300,
          fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase",
          color: "rgba(216,195,165,0.75)", marginBottom: 6,
        }}>
          In liebevoller Erinnerung
        </p>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
          fontSize: 22, letterSpacing: "0.03em",
          color: "#F7F3ED", marginBottom: 5,
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          lineHeight: 1.2,
        }}>
          {name}
        </h2>

        {(birth || death) && (
          <p style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: 10, letterSpacing: "0.1em",
            color: "rgba(216,195,165,0.65)", marginBottom: 6,
          }}>
            {birth && `* ${birth}`}{birth && death && "  ·  "}{death && `† ${death}`}
          </p>
        )}

        {caseData?.burial_type && (
          <p style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: 8.5, letterSpacing: "0.14em",
            color: "rgba(216,195,165,0.4)", marginBottom: 4,
          }}>
            {caseData.burial_type}
          </p>
        )}

        {funeralHome?.name && (
          <p style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: 7.5, letterSpacing: "0.1em",
            color: "rgba(216,195,165,0.28)", marginTop: 6,
          }}>
            {funeralHome.name}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── INSIDE ────────────────────────────────────────────────────────────────────

const RELIGION_SYMBOLS = {
  Christlich: "✝",
  Evangelisch: "✝",
  Muslimisch: "☪",
  Spirituell: "✦",
  Weltlich: "◆",
};

function CardInside({ caseData, generatedText, cardFormat, religion }) {
  const name = caseData
    ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}`
    : "";

  const aspectMap = {
    DIN_A6_landscape: "148/105",
    DIN_lang_portrait: "99/210",
    DIN_A5_folded: "148/210",
    Leporello: "148/105",
  };
  const aspect = aspectMap[cardFormat] || "148/210";
  const symbol = RELIGION_SYMBOLS[religion] || "◆";

  return (
    <div style={{
      aspectRatio: aspect,
      background: "linear-gradient(180deg, #FEFCF9 0%, #F7F3ED 100%)",
      border: "1px solid #EAE0D0",
      borderRadius: 12,
      boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
    }}>
      {/* Top ornament */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
        <span style={{ color: "#B07B34", fontSize: 13 }}>{symbol}</span>
        <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {generatedText ? (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 14,
            color: "#4A4540",
            lineHeight: 2,
            textAlign: "center",
            maxWidth: "90%",
          }}>
            {generatedText}
          </p>
        ) : (
          <div style={{ width: "100%" }}>
            {[85, 70, 90, 65, 78].map((w, i) => (
              <div key={i} style={{
                height: 10, borderRadius: 5, margin: "8px auto",
                background: "rgba(201,169,110,0.1)", width: `${w}%`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom ornament + name */}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8 }}>
          <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#D8C3A5" }} />
          <div style={{ height: 1, width: 24, background: "#D8C3A5" }} />
        </div>
        {name && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            fontSize: 12, letterSpacing: "0.06em", color: "#8A7F72",
          }}>
            {name}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export default function CardPrintPreview({ caseData, generatedText, motifImageUrl, cardFormat, side, funeralHome, heroImageUrl, religion }) {
  if (side === "front") {
    return (
      <CardFront
        caseData={caseData}
        motifImageUrl={motifImageUrl}
        cardFormat={cardFormat}
        funeralHome={funeralHome}
        heroImageUrl={heroImageUrl}
      />
    );
  }
  return (
    <CardInside
      caseData={caseData}
      generatedText={generatedText}
      cardFormat={cardFormat}
      religion={religion}
    />
  );
}