import { format } from "date-fns";
import { de } from "date-fns/locale";

function formatDateDE(d) {
  if (!d) return null;
  try { return format(new Date(d), "d. MMMM yyyy", { locale: de }); }
  catch { return d; }
}

export default function HeroSection({ memorial }) {
  const born = formatDateDE(memorial.birth_date);
  const died = formatDateDE(memorial.death_date);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: memorial.hero_image_url
          ? `url(${memorial.hero_image_url})`
          : "linear-gradient(160deg, #3A2F22 0%, #2A2218 55%, #1E1A14 100%)",
        backgroundSize: "cover",
        backgroundPosition: `center ${memorial.hero_image_position ?? 50}%`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(30,26,20,0.92) 0%, rgba(30,26,20,0.55) 45%, rgba(30,26,20,0.3) 100%)" }}
      />
      {/* Warm glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 65% at 75% 35%, rgba(216,195,165,0.13) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Content */}
      <div className="relative text-white text-center px-6 w-full max-w-3xl mx-auto fade-in flex flex-col items-center justify-center flex-1">

        {/* Portrait or initial */}
        <div className="mb-8">
          {memorial.hero_image_url ? (
            <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(216,195,165,0.28)", boxShadow: "0 0 0 6px rgba(176,123,52,0.08)", margin: "0 auto" }}>
              <img src={memorial.hero_image_url} alt={memorial.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `center ${memorial.hero_image_position ?? 50}%` }} />
            </div>
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #D8C3A5, #A89A8A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "3px solid rgba(216,195,165,0.28)", boxShadow: "0 0 0 6px rgba(176,123,52,0.08)" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#2F2D2A" }}>{memorial.name?.[0]}</span>
            </div>
          )}
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 52, color: "#F7F3ED", lineHeight: 1.1, marginBottom: 16, textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
          {memorial.name}
        </h1>

        {(born || died) && (
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 14, color: "#D8C3A5", letterSpacing: "0.08em", marginBottom: 24, textTransform: "uppercase" }}>
            {born && <span>{born}</span>}
            {born && died && <span style={{ margin: "0 16px", opacity: 0.4 }}>·</span>}
            {died && <span>{died}</span>}
          </p>
        )}

        {memorial.subtitle && (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 20, color: "rgba(237,227,211,0.72)", maxWidth: 480, margin: "0 auto" }}>
            <span style={{ color: "#B07B34", opacity: 0.35, fontSize: 24, marginRight: 4 }}>❝</span>{memorial.subtitle}
          </p>
        )}
      </div>

      {/* Scroll invitation */}
      <div className="relative pb-10 flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
        <p className="text-xs tracking-[0.25em] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          Eine Reise durch das Leben
        </p>
        <div className="w-px h-8 animate-bounce" style={{ background: "rgba(255,255,255,0.2)" }} />
      </div>
    </section>
  );
}