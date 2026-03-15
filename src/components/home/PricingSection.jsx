import { useState } from "react";
import { Check, X } from "lucide-react";
import { createPageUrl } from "@/utils";

const B2C_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Kostenlos",
    period: "Zum Kennenlernen",
    features: [
      { text: "1 Gedenkseite", included: true },
      { text: "Bis zu 10 Kondolenz-Einträge", included: true },
      { text: "5 Fotos", included: true },
      { text: "Evertrace-Branding", included: true },
      { text: "Audio & Spotify", included: false },
      { text: "Stammbaum", included: false },
      { text: "Passwortschutz", included: false },
    ],
    cta: "Kostenlos starten",
    ctaLink: createPageUrl("Dashboard"),
    highlight: false,
  },
  {
    id: "classic",
    name: "Classic",
    badge: "Beliebteste Wahl",
    price: "€ 79,–",
    period: "einmalige Zahlung",
    description: "Einmal zahlen — für immer bewahren.",
    features: [
      { text: "Unbegrenzte Gedenkseite", included: true },
      { text: "Unbegrenzte Kondolenz-Einträge", included: true },
      { text: "Unbegrenzte Fotos & Audio", included: true },
      { text: "Stammbaum mit verlinkten Seiten", included: true },
      { text: "Spotify-Integration", included: true },
      { text: "Digitale Briefe mit Zeitversand", included: true },
      { text: "Passwortschutz", included: true },
      { text: "QR-Code", included: true },
    ],
    cta: "Erinnerung jetzt gestalten",
    ctaLink: createPageUrl("Dashboard"),
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "€ 149,–",
    period: "einmalige Zahlung",
    description: "Alles inklusive, keinerlei Kompromisse.",
    features: [
      { text: "Alles aus Classic", included: true },
      { text: "KI-Trauerkarte (4 Motive inklusive)", included: true },
      { text: "Kondolenzbuch als Druckprodukt", included: true },
      { text: "Persönliche Betreuung", included: true },
      { text: "Individuelle Memorial-URL", included: true },
    ],
    cta: "Vollständiges Erbe sichern",
    ctaLink: createPageUrl("Dashboard"),
    highlight: false,
  },
];

const B2B_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "€ 0",
    period: "/Monat",
    features: ["3 Fälle / Monat", "3 Karten", "1 Gedenkseite", "Kein White-Label", "Kein Print"],
    excluded: ["White-Label", "Print-on-Demand", "Analytics"],
    cta: "Kostenlos starten",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "€ 39",
    period: "/Monat",
    features: ["15 Fälle / Monat", "20 Karten", "White-Label", "Print-on-Demand"],
    excluded: ["Analytics", "Jahrestags-Erinnerungen"],
    cta: "Jetzt starten",
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "€ 99",
    period: "/Monat",
    features: ["50 Fälle / Monat", "75 Karten", "Vollständiges Analytics", "Jahrestags-Erinnerungen", "3 Nutzer"],
    excluded: [],
    cta: "Premium wählen",
    highlight: true,
    badge: "Empfohlen",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "ab € 299",
    period: "/Monat",
    features: ["Unbegrenzte Fälle & Karten", "Custom-Domain", "API-Zugang", "Persönlicher Account-Manager"],
    excluded: [],
    cta: "Angebot anfragen",
    highlight: false,
  },
];

export default function PricingSection() {
  const [tab, setTab] = useState("b2c");

  return (
    <section id="pricing" className="py-28 px-6" style={{ background: "#0f0e0c" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#c9a96e" }}>
            Preise & Tarife
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Transparent. Einmalig. Oder monatlich.
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto font-light leading-relaxed">
            Für Privatpersonen: einmalige Zahlung, ewige Erinnerung. Für Bestatter: monatliche Lizenz mit vollem Feature-Set.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[
            { id: "b2c", label: "Für Privatpersonen" },
            { id: "b2b", label: "Für Bestattungshäuser" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "rgba(201,169,110,0.15)" : "transparent",
                border: `1px solid ${tab === t.id ? "#c9a96e" : "rgba(201,169,110,0.2)"}`,
                color: tab === t.id ? "#c9a96e" : "#8a8278",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* B2C */}
        {tab === "b2c" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {B2C_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-7 flex flex-col transition-all duration-300"
                style={{
                  background: plan.highlight ? "rgba(201,169,110,0.06)" : "#181714",
                  border: plan.highlight ? "1.5px solid #c9a96e" : "1px solid #302d28",
                  boxShadow: plan.highlight ? "0 0 40px rgba(201,169,110,0.12)" : "none",
                }}
              >
                {plan.badge && (
                  <div className="inline-flex mb-3">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <p className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{plan.name}</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: plan.highlight ? "#c9a96e" : "#f0ede8" }}>{plan.price}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: "#5a554e" }}>{plan.period}</p>
                {plan.description && <p className="text-sm mb-5 leading-relaxed" style={{ color: "#8a8278" }}>{plan.description}</p>}
                <div className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5">
                      {f.included
                        ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c9a96e" }} />
                        : <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#302d28" }} />}
                      <span className="text-sm" style={{ color: f.included ? "#d4c5a9" : "#5a554e" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={plan.ctaLink}
                  className="block text-center py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: plan.highlight ? "#c9a96e" : "transparent",
                    color: plan.highlight ? "#0f0e0c" : "#c9a96e",
                    border: plan.highlight ? "none" : "1px solid rgba(201,169,110,0.4)",
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* B2B */}
        {tab === "b2b" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {B2B_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-6 flex flex-col transition-all duration-300"
                style={{
                  background: plan.highlight ? "rgba(201,169,110,0.06)" : "#181714",
                  border: plan.highlight ? "1.5px solid #c9a96e" : "1px solid #302d28",
                  boxShadow: plan.highlight ? "0 0 40px rgba(201,169,110,0.12)" : "none",
                }}
              >
                {plan.badge && (
                  <div className="inline-flex mb-3">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <p className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{plan.name}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: plan.highlight ? "#c9a96e" : "#f0ede8" }}>{plan.price}</span>
                  <span className="text-sm ml-1" style={{ color: "#5a554e" }}>{plan.period}</span>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#c9a96e" }} />
                      <span className="text-xs" style={{ color: "#d4c5a9" }}>{f}</span>
                    </div>
                  ))}
                  {plan.excluded?.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#302d28" }} />
                      <span className="text-xs" style={{ color: "#5a554e" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="/B2BRegister"
                  className="block text-center py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: plan.highlight ? "#c9a96e" : "transparent",
                    color: plan.highlight ? "#0f0e0c" : "#c9a96e",
                    border: plan.highlight ? "none" : "1px solid rgba(201,169,110,0.4)",
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        )}

        {tab === "b2c" && (
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs" style={{ color: "#5a554e" }}>
              Einmalige Zahlung · Gedenkseite bleibt dauerhaft online · Keine versteckten Kosten
            </p>
            <p className="text-xs" style={{ color: "#5a554e" }}>
              Zahlung per Kreditkarte, PayPal oder SEPA-Lastschrift
            </p>
          </div>
        )}
        {tab === "b2b" && (
          <p className="text-center text-xs mt-8" style={{ color: "#5a554e" }}>
            Alle B2B-Preise zzgl. MwSt. · Monatlich kündbar · Zahlung per SEPA oder Kreditkarte
          </p>
        )}
      </div>
    </section>
  );
}