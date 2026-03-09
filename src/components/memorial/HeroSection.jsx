import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Heart } from "lucide-react";

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
      className="relative min-h-screen flex items-end justify-center parallax-hero"
      style={{
        backgroundImage: memorial.hero_image_url
          ? `url(${memorial.hero_image_url})`
          : "linear-gradient(160deg,#1c1917,#3b2a1a)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.15) 100%)" }}
      />

      {/* Content */}
      <div className="relative text-white text-center pb-16 px-6 w-full max-w-3xl mx-auto fade-in">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-12 bg-amber-400 opacity-70" />
          <Heart className="w-4 h-4 text-amber-400" />
          <div className="h-px w-12 bg-amber-400 opacity-70" />
        </div>

        <h1
          className="text-5xl md:text-7xl font-semibold mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          {memorial.name}
        </h1>

        {(born || died) && (
          <p className="text-base md:text-lg font-light tracking-widest text-stone-300 mb-4 uppercase">
            {born && <span>{born}</span>}
            {born && died && <span className="mx-3 text-amber-400">·</span>}
            {died && <span>{died}</span>}
          </p>
        )}

        {memorial.subtitle && (
          <p
            className="text-xl md:text-2xl text-stone-200 font-light italic max-w-xl mx-auto mt-4"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 1px 10px rgba(0,0,0,0.3)" }}
          >
            „{memorial.subtitle}"
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-px h-10 bg-white/40 mx-auto" />
      </div>
    </section>
  );
}