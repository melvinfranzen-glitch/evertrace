import { useState } from "react";
import { Check, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const B2C_FREE_FEATURES = [
  { text: "1 Gedenkseite", included: true },
  { text: "Max. 10 Kondolenzeinträge", included: true },
  { text: "Max. 5 Fotos", included: true },
  { text: "Evertrace-Branding", included: true },
  { text: "Audio-Uploads", included: false },
  { text: "Stammbaum", included: false },
  { text: "Passwortschutz", included: false },
  { text: "Individuelle Gedenkseiten-URL", included: false },
];

const B2C_PREMIUM_FEATURES = [
  { text: "Unbegrenzte Gedenkseiten", included: true },
  { text: "Unbegrenzte Kondolenzeinträge", included: true },
  { text: "Unbegrenzte Fotos & Audio-Uploads", included: true },
  { text: "Stammbaum mit verlinkten Gedenkseiten", included: true },
  { text: "Spotify-Playlist-Integration", included: true },
  { text: "Digitale Briefe mit zeitverzögerter Freischaltung", included: true },
  { text: "Zeitleiste & Vermächtnis-Abschnitte", included: true },
  { text: "Passwortschutz", included: true },
  { text: "Individuelle Gedenkseiten-URL", included: true },
];

export default function PricingSection() {
  const [billing, setBilling] = useState("annual"); // "monthly" | "annual"

  return (
    <section id="pricing" className="py-28 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#c9a96e" }}>Preise</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Das Vermächtnis bewahren
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto font-light leading-relaxed text-base">
            Alle Preise verstehen sich zzgl. MwSt.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-7 p-1 rounded-xl" style={{ background: "#f0ede8", border: "1px solid #e5ddd0" }}>
            <button
              onClick={() => setBilling("annual")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: billing === "annual" ? "white" : "transparent",
                color: billing === "annual" ? "#2c1a0e" : "#9a8c7e",
                boxShadow: billing === "annual" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Jährlich <span className="text-xs ml-1 px-1.5 py-0.5 rounded" style={{ background: "#c9a96e20", color: "#b08040" }}>2 Monate gratis</span>
            </button>
            <button
              onClick={() => setBilling("monthly")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: billing === "monthly" ? "white" : "transparent",
                color: billing === "monthly" ? "#2c1a0e" : "#9a8c7e",
                boxShadow: billing === "monthly" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Monatlich
            </button>
          </div>
        </div>

        {/* Plans grid — 2 columns: Free + Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Free */}
          <div className="rounded-2xl p-8" style={{ background: "white", border: "1.5px solid #e7e5e4" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9a8c7e" }}>Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-gray-900">€ 0</span>
            </div>
            <p className="text-xs mb-6" style={{ color: "#9a8c7e" }}>zzgl. MwSt.</p>
            <ul className="space-y-2.5 mb-8">
              {B2C_FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  {f.included
                    ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#7a9688" }} />
                    : <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c9c0b8" }} />
                  }
                  <span style={{ color: f.included ? "#4b5563" : "#c9c0b8" }}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full rounded-xl py-5 font-medium"
              style={{ background: "#f0ede8", color: "#57534e" }}
              onClick={() => window.location.href = createPageUrl("Dashboard")}
            >
              Kostenlos erstellen
            </Button>
          </div>

          {/* Premium */}
          <div className="relative rounded-2xl p-8" style={{ background: "linear-gradient(160deg,#fffcf5,#fff)", border: "2px solid #c9a96e", boxShadow: "0 8px 40px rgba(201,169,110,0.18)" }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{ background: "#c9a96e", color: "#1c1917" }}>
              ✦ Empfohlen
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 mt-2" style={{ color: "#b08040" }}>Premium</p>
            {billing === "annual" ? (
              <>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-5xl font-bold text-gray-900">€ 99,–</span>
                  <span className="text-sm text-gray-400">/ Jahr</span>
                </div>
                <p className="text-sm mb-1" style={{ color: "#b08040" }}>€ 8,25 / Monat · 2 Monate gratis</p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-5xl font-bold text-gray-900">€ 12,90</span>
                  <span className="text-sm text-gray-400">/ Monat</span>
                </div>
              </>
            )}
            <p className="text-xs mb-6" style={{ color: "#9a8c7e" }}>zzgl. MwSt.</p>
            <ul className="space-y-2.5 mb-6">
              {B2C_PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#7a9688" }} />
                  <span className="text-gray-700">{f.text}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full rounded-xl py-5 font-semibold"
              style={{ background: "linear-gradient(135deg,#c9a84c,#a07830)", color: "#1c1917", boxShadow: "0 6px 24px rgba(201,168,76,0.4)" }}
              onClick={() => window.location.href = createPageUrl("Dashboard")}
            >
              Premium freischalten
            </Button>

            {/* Lifetime option */}
            <div className="mt-5 pt-5 border-t border-amber-100 rounded-xl px-4 py-4" style={{ background: "rgba(201,169,110,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">Lifetime</span>
                <span className="text-sm font-bold" style={{ color: "#b08040" }}>€ 179,–</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">Einmalzahlung — für immer</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Ideal für Familien, die ein dauerhaftes digitales Erbe schaffen möchten — ohne monatliche Kosten.
              </p>
              <button
                className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "transparent", color: "#b08040", border: "1px solid rgba(176,128,64,0.4)" }}
                onClick={() => window.location.href = createPageUrl("Dashboard")}
              >
                Einmalig kaufen
              </button>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { icon: "🔒", label: "SSL-verschlüsselt" },
            { icon: "🇩🇪", label: "Hosting in Deutschland" },
            { icon: "✅", label: "DSGVO-konform" },
            { icon: "💳", label: "Sichere Zahlung" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-xs text-stone-500 bg-white shadow-sm">
              <span>{b.icon}</span><span>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Physical Add-on */}
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white flex flex-col md:flex-row">
          <div className="relative md:w-64 h-52 md:h-auto flex-shrink-0 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85" alt="Gedenkplakette" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(28,22,8,0.3),transparent)" }} />
            <div className="absolute bottom-3 left-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.9)", color: "#1c1917" }}>Physisches Produkt</span>
            </div>
          </div>
          <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Package className="w-4 h-4" style={{ color: "#c9a84c" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a84c" }}>Gedenkplakette</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Die digitale Brücke zum ewigen Gedenken
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Feinste Gravur in gebürstetem Aluminium oder Edelstahl — mit persönlichem QR-Code. An Grabstein, Urne oder Trauerkarte: eine stille Einladung zur Erinnerung.
              </p>
              <div className="flex gap-4 mt-3 text-xs" style={{ color: "#9a8c7e" }}>
                <span>Standard ab <strong className="text-gray-700">€ 149,–</strong></span>
                <span>Premium ab <strong className="text-gray-700">€ 219,–</strong></span>
              </div>
              <p className="text-xs mt-1" style={{ color: "#9a8c7e" }}>zzgl. MwSt.</p>
            </div>
            <div className="text-center flex-shrink-0">
              <Button
                className="rounded-xl text-sm px-6 py-2.5 font-medium"
                style={{ background: "linear-gradient(135deg,#c9a84c,#a07830)", color: "#1c1917" }}
                onClick={() => window.location.href = createPageUrl("Shop")}
              >
                Zur Plakette →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}