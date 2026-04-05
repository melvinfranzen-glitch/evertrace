import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowDown, Sparkles, ShieldCheck } from "lucide-react";
import EvertraceLogo from "@/components/EvertraceLogo";

export default function HeroLanding() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{ background: "linear-gradient(160deg, #3D3326 0%, #2A2218 55%, #1E1A14 100%)" }}>
      {/* Subtle forest background */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.25, zIndex: 0, pointerEvents: "none" }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 1000">
        {/* Distant trees */}
        <defs>
          <pattern id="forest" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            <path d="M80,400 L70,300 L60,250 L50,200 L60,180 L40,150 L45,120" stroke="#6b5a44" strokeWidth="4" fill="none" opacity="0.6" />
            <path d="M150,400 L140,320 L130,270 L120,210 L130,185 L110,155 L115,130" stroke="#6b5a44" strokeWidth="3" fill="none" opacity="0.5" />
            <path d="M220,400 L210,310 L200,260 L190,200 L200,170 L180,140 L185,110" stroke="#6b5a44" strokeWidth="3" fill="none" opacity="0.5" />
            <path d="M320,400 L310,290 L300,240 L290,180 L300,160 L280,120 L285,90" stroke="#6b5a44" strokeWidth="4" fill="none" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="1200" height="1000" fill="url(#forest)" />
      </svg>
      {/* Warm amber glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 70% at 65% 45%, rgba(216,195,165,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 45% 45% at 15% 85%, rgba(176,123,52,0.09) 0%, transparent 55%)", pointerEvents: "none" }} />

      <div className="relative text-center px-6 max-w-4xl mx-auto fade-in" style={{ paddingTop: 64, zIndex: 1 }}>
        {/* Logo */}
        <div className="flex justify-center mb-12" style={{ transform: "scale(1.4)" }}>
          <EvertraceLogo variant="dark" size="xl" />
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12" style={{ background: "rgba(216,195,165,0.35)" }} />
          <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "#B07B34", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
            Digitale Gedenkkultur
          </span>
          <div className="h-px w-12" style={{ background: "rgba(216,195,165,0.35)" }} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(40px, 5.5vw, 68px)", color: "#F7F3ED", lineHeight: 1.08, marginBottom: 24 }}>
          Ein würdevoller Ort
          <br />
          <span style={{ color: "#D8C3A5" }}>für die Menschen,</span>
          <br />
          die wir nie vergessen.
        </h1>

        <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(216,195,165,0.68)", maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.8 }}>
          Evertrace hilft Ihnen, die Geschichte eines geliebten Menschen dauerhaft zu bewahren — mit einer persönlichen Gedenkseite, Trauerkarten und bleibenden Erinnerungsstücken.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="flex items-center gap-2.5 px-10 py-4 rounded-full text-sm font-normal transition-all duration-300"
            style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400, boxShadow: "0 4px 24px rgba(176,123,52,0.35)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#7A5520"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#B07B34"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Heart className="w-4 h-4" />
            Gedenkseite erstellen
          </button>
          <a
            href="https://vehement-ever-trace-life.base44.app/MemorialProfile?id=IHSC9WDN"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 rounded-full text-sm transition-all duration-300"
            style={{ border: "1px solid rgba(216,195,165,0.3)", color: "#D8C3A5", fontFamily: "'Lato', sans-serif", fontWeight: 300, background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(216,195,165,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Beispiel-Gedenkseite ansehen →
          </a>
        </div>

        {/* Trust indicators */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(216,195,165,0.1)" }}>
          {[
            { icon: "✦", label: "Persönliche Gestaltung", sub: "So einzigartig wie der Mensch, an den Sie erinnern" },
            { icon: "🛡", label: "DSGVO-konform", sub: "Server in Deutschland" },
            { icon: "👨‍👩‍👧", label: "Für Familien & Bestatter", sub: "Privat und für Bestattungshäuser" },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(216,195,165,0.08)", border: "1px solid rgba(216,195,165,0.14)", fontSize: 16 }}>
                {icon}
              </div>
              <div>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(237,227,211,0.85)", marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(216,195,165,0.55)" }}>{sub}</p>
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