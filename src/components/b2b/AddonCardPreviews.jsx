import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

function MiniCardShell({ heroImageUrl, motifImageUrl, children }) {
  const bgImage = heroImageUrl || motifImageUrl;
  return (
    <div style={{ position: "relative", aspectRatio: "148/105", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      {bgImage ? (
        <img src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: heroImageUrl ? "center 25%" : "center" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#1a1a18,#0f0e0c)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", textAlign: "center", padding: "0 12px 12px" }}>
        {children}
      </div>
    </div>
  );
}

export function InvitationCardPreview({ caseData, funeralHome, heroImageUrl, motifImageUrl }) {
  const name = caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Vorname Nachname";
  const death = caseData?.date_of_death ? fmtDate(caseData.date_of_death) : "";

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Vorderseite */}
      <div>
        <p className="text-xs mb-1" style={{ color: "#5a554e" }}>Außen</p>
        <MiniCardShell heroImageUrl={heroImageUrl} motifImageUrl={motifImageUrl}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <div style={{ height: 1, width: 14, background: "rgba(216,195,165,0.5)" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#c9a96e" }} />
            <div style={{ height: 1, width: 14, background: "rgba(216,195,165,0.5)" }} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 6, letterSpacing: "0.2em", color: "rgba(216,195,165,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Einladung zur Trauerfeier</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#F7F3ED", marginBottom: 3 }}>{name}</p>
          {death && <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 7, color: "rgba(216,195,165,0.55)" }}>† {death}</p>}
          {funeralHome?.name && <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 6, color: "rgba(216,195,165,0.25)", marginTop: 4 }}>{funeralHome.name}</p>}
        </MiniCardShell>
      </div>
      {/* Innenseite */}
      <div>
        <p className="text-xs mb-1" style={{ color: "#5a554e" }}>Innen</p>
        <div style={{
          aspectRatio: "148/105", borderRadius: 8, border: "1px solid #EAE0D0",
          background: "linear-gradient(180deg,#FEFCF9,#F7F3ED)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "10px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 9, color: "#8A7F72", textAlign: "center", lineHeight: 1.7, fontStyle: "italic" }}>
            Wir laden Sie herzlich ein,<br />gemeinsam Abschied zu nehmen.
          </p>
          <div style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ height: 1, width: 16, background: "#D8C3A5" }} />
            <div style={{ width: 2, height: 2, borderRadius: "50%", background: "#D8C3A5" }} />
            <div style={{ height: 1, width: 16, background: "#D8C3A5" }} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 7.5, color: "#B0A899", textAlign: "center", lineHeight: 1.6 }}>
            Datum · Uhrzeit<br />Ort der Trauerfeier
          </p>
        </div>
      </div>
    </div>
  );
}

export function ThankyouCardPreview({ caseData, funeralHome, heroImageUrl, motifImageUrl }) {
  const name = caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Vorname Nachname";

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Vorderseite */}
      <div>
        <p className="text-xs mb-1" style={{ color: "#5a554e" }}>Außen</p>
        <MiniCardShell heroImageUrl={heroImageUrl} motifImageUrl={motifImageUrl}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <div style={{ height: 1, width: 14, background: "rgba(216,195,165,0.5)" }} />
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#c9a96e" }} />
            <div style={{ height: 1, width: 14, background: "rgba(216,195,165,0.5)" }} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 6, letterSpacing: "0.2em", color: "rgba(216,195,165,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Danksagung</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#F7F3ED", marginBottom: 3 }}>{name}</p>
          {funeralHome?.name && <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 6, color: "rgba(216,195,165,0.25)", marginTop: 4 }}>{funeralHome.name}</p>}
        </MiniCardShell>
      </div>
      {/* Innenseite */}
      <div>
        <p className="text-xs mb-1" style={{ color: "#5a554e" }}>Innen</p>
        <div style={{
          aspectRatio: "148/105", borderRadius: 8, border: "1px solid #EAE0D0",
          background: "linear-gradient(180deg,#FEFCF9,#F7F3ED)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "10px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 9, color: "#8A7F72", textAlign: "center", lineHeight: 1.7, fontStyle: "italic" }}>
            Für Ihre Anteilnahme,<br />Blumen und freundlichen Worte<br />danken wir von Herzen.
          </p>
          <div style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ height: 1, width: 16, background: "#D8C3A5" }} />
            <div style={{ width: 2, height: 2, borderRadius: "50%", background: "#D8C3A5" }} />
            <div style={{ height: 1, width: 16, background: "#D8C3A5" }} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 7.5, color: "#B0A899", textAlign: "center" }}>
            Die Familie
          </p>
        </div>
      </div>
    </div>
  );
}