import { createPageUrl } from "@/utils";
import { Heart, ArrowDown, Sparkles, QrCode, ShieldCheck } from "lucide-react";

export default function HeroLanding() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
    >
      {/* Background image with heavy overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(20,15,10,0.88) 0%, rgba(30,22,12,0.80) 50%, rgba(45,28,8,0.85) 100%)" }}
        />
        {/* Subtle gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 70%, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative text-center px-6 max-w-4xl mx-auto fade-in">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px w-12 opacity-60" style={{ background: "#c9a84c" }} />
          <span className="text-xs uppercase tracking-[0.35em] font-medium opacity-90" style={{ color: "#c9a84c" }}>
            Digitale Gedenkkultur
          </span>
          <div className="h-px w-12 opacity-60" style={{ background: "#c9a84c" }} />
        </div>

        <h1
          className="text-5xl md:text-7xl font-semibold mb-7 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}
        >
          Eine Geschichte
          <br />
          <span style={{ color: "#c9a84c" }}>für die Ewigkeit,</span>
          <br />
          wo Erinnerungen lebendig bleiben.
        </h1>

        <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Ein würdevoller Ort für die Geschichte eines geliebten Menschen —
          mit persönlicher Biografie, digitaler Gedenkseite und bleibenden Erinnerungsstücken.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() => window.location.href = createPageUrl("Dashboard")}
            className="group flex items-center gap-2.5 px-10 py-4 rounded-full text-base font-medium transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #a07830)",
              color: "#1c1917",
              boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 32px rgba(201,168,76,0.50)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,168,76,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Heart className="w-4.5 h-4.5" />
            Gedenkseite erstellen
          </button>
          <button
            className="px-10 py-4 rounded-full text-base font-medium border transition-all duration-300 bg-transparent"
            style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)" }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}
          >
            Mehr erfahren
          </button>
        </div>

        {/* Trust stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {[
            { icon: Sparkles, label: "Lebensgeschichte", sub: "Würdevoll & persönlich" },
            { icon: QrCode, label: "QR-Plaketten", sub: "Messing · Schiefer" },
            { icon: ShieldCheck, label: "DSGVO-konform", sub: "Hosting in DE" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Icon className="w-5 h-5" style={{ color: "#c9a84c" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none mb-0.5">{label}</p>
                <p className="text-xs text-stone-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-500 hover:text-stone-300 transition-colors animate-bounce"
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Weiter scrollen"
      >
        <ArrowDown className="w-5 h-5" />
      </button>
    </section>
  );
}