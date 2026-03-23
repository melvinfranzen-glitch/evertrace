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
        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-amber-400/60" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z" fill="#c9a84c" opacity="0.7"/>
            <circle cx="12" cy="12" r="2.5" fill="#c9a84c"/>
          </svg>
          <div className="h-px w-10 bg-amber-400/60" />
        </div>

        <h1
          className="text-5xl md:text-7xl font-semibold mb-5 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
        >
          {memorial.name}
        </h1>

        {(born || died) && (
          <p className="text-base md:text-lg font-light tracking-widest text-stone-300 mb-6 uppercase">
            {born && <span>{born}</span>}
            {born && died && <span className="mx-4 text-amber-400/70">·</span>}
            {died && <span>{died}</span>}
          </p>
        )}

        {memorial.subtitle && (
          <p
            className="text-xl md:text-2xl text-stone-200/90 font-light italic max-w-xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
          >
            „{memorial.subtitle}"
          </p>
        )}
      </div>

      {/* Scroll invitation */}
      <div className="relative pb-10 flex flex-col items-center gap-3 text-white/50">
        <p className="text-xs tracking-[0.25em] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Eine Reise durch das Leben
        </p>
        <div className="w-px h-8 bg-white/25 animate-bounce" />
      </div>
    </section>
  );
}