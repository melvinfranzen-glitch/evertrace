import { Sparkles, CreditCard } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CardTeaser() {
  return (
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row"
          style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1f0a 100%)" }}>

          {/* Text side */}
          <div className="flex-1 p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: "#c9a84c" }} />
              <span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: "#c9a84c" }}>
                Neu · KI-Feature
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Trauerkarten mit KI gestalten
            </h2>
            <p className="text-stone-400 text-base leading-relaxed mb-7 max-w-lg">
              Erstellen Sie in wenigen Minuten 4 einzigartige, künstlerische Trauerkarten-Designs —
              Aquarelle, Lichtspiele, Lebensbäume. Die KI nutzt Biografie und Foto der Gedenkseite als Basis.
              Print-Ready PDF oder direkt drucken lassen.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["4 KI-Designs", "Aquarell & Abstrakt", "PDF-Export", "Druck & Versand"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => window.location.href = createPageUrl("Dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm self-start transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #c9a84c, #a07830)", color: "#1c1917", boxShadow: "0 4px 20px rgba(201,168,76,0.35)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(201,168,76,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,168,76,0.35)"; e.currentTarget.style.transform = ""; }}
            >
              <CreditCard className="w-4 h-4" />
              Jetzt gestalten
            </button>
          </div>

          {/* Visual side */}
          <div className="md:w-80 relative hidden md:flex items-center justify-center p-10">
            {/* Stacked card mockups */}
            <div className="relative w-48">
              {/* Card 3 - back */}
              <div className="absolute -right-6 top-4 w-40 h-56 rounded-xl rotate-6 overflow-hidden shadow-xl opacity-60"
                style={{ background: "linear-gradient(135deg, #4a3520, #2d1f0a)" }}>
                <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&q=70" alt="" className="w-full h-full object-cover opacity-40" />
              </div>
              {/* Card 2 - middle */}
              <div className="absolute -right-3 top-2 w-40 h-56 rounded-xl rotate-3 overflow-hidden shadow-xl opacity-80"
                style={{ background: "linear-gradient(135deg, #3d2a14, #1c1410)" }}>
                <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=70" alt="" className="w-full h-full object-cover opacity-50" />
              </div>
              {/* Card 1 - front */}
              <div className="relative w-40 h-56 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #2d1f0a, #1a1410)" }}>
                <img src="https://images.unsplash.com/photo-1490750967868-88df5691cc51?w=300&q=80" alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,2,0.8) 0%, transparent 50%)" }} />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-xs font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Maria Schmidt</p>
                  <p className="text-stone-400 text-xs">1942 — 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}