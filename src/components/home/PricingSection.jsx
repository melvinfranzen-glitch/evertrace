import { useState } from "react";
import { Check, X } from "lucide-react";
import { createPageUrl } from "@/utils";

const B2C_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Kostenlos",
    period: "Zum Anfangen",
    features: [
      { text: "1 Gedenkseite", included: true },
      { text: "Bis zu 10 Kondolenz-Einträge", included: true },
      { text: "5 Fotos", included: true },
      { text: "Evertrace-Branding", included: true },
      { text: "Audio & Spotify", included: false },
      { text: "Stammbaum", included: false },
      { text: "Passwortschutz", included: false },
    ],
    cta: "Kostenlos beginnen",
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
    cta: "Erinnerung gestalten",
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
      { text: "Personalisierte Trauerkarte (4 Motive inklusive)", included: true },
      { text: "Kondolenzbuch als Druckprodukt", included: true },
      { text: "Persönliche Betreuung", included: true },
      { text: "Individuelle Memorial-URL", included: true },
    ],
    cta: "Das vollständige Andenken",
    ctaLink: createPageUrl("Dashboard"),
    highlight: false,
  },
];

const B2B_PLANS = [
  { id: "free", name: "Free", price: "€ 0", period: "/Monat", features: ["3 Fälle / Monat", "3 Karten", "1 Gedenkseite", "Kein White-Label", "Kein Print"], excluded: ["White-Label", "Print-on-Demand", "Analytics"], cta: "Kostenlos testen", highlight: false },
  { id: "starter", name: "Starter", price: "€ 39", period: "/Monat", features: ["15 Fälle / Monat", "20 Karten", "White-Label", "Print-on-Demand"], excluded: ["Analytics", "Jahrestags-Erinnerungen"], cta: "Starter wählen", highlight: false },
  { id: "premium", name: "Premium", price: "€ 99", period: "/Monat", features: ["50 Fälle / Monat", "75 Karten", "Vollständiges Analytics", "Jahrestags-Erinnerungen", "3 Nutzer"], excluded: [], cta: "Premium wählen", highlight: true, badge: "Empfohlen" },
  { id: "enterprise", name: "Enterprise", price: "ab € 299", period: "/Monat", features: ["Unbegrenzte Fälle & Karten", "Custom-Domain", "API-Zugang", "Persönlicher Account-Manager"], excluded: [], cta: "Angebot anfragen", highlight: false },
];

export default function PricingSection() {
  const [tab, setTab] = useState("b2c");

  return (
    <section id="pricing" className="py-28 px-6" style={{ background: "#2F2D2A" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 11, color: "#B07B34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
            Preise & Tarife
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 42, color: "#F7F3ED", lineHeight: 1.1, marginBottom: 16 }}>
            Transparent. Einmalig. Oder monatlich.
          </h2>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(216,195,165,0.55)", maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            Für Privatpersonen: einmalige Zahlung, ewige Erinnerung. Für Bestatter: monatliche Lizenz mit vollem Feature-Set.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[
            { id: "b2c", label: "Für Privatpersonen" },
            { id: "b2b", label: "Für Bestattungshäuser" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: tab === t.id ? "rgba(176,123,52,0.15)" : "transparent",
                border: `1px solid ${tab === t.id ? "#B07B34" : "rgba(176,123,52,0.2)"}`,
                color: tab === t.id ? "#B07B34" : "#A89A8A",
                fontFamily: "'Lato', sans-serif", fontWeight: 400,
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
              <div key={plan.id} className="rounded-2xl p-7 flex flex-col transition-all duration-300"
                style={{
                  background: plan.highlight ? "linear-gradient(160deg, #FEFCF9 0%, #FDF7F0 100%)" : "#FEFCF9",
                  border: plan.highlight ? "1px solid #B07B34" : "1px solid #EAE0D0",
                  boxShadow: plan.highlight ? "0 8px 40px rgba(176,123,52,0.1)" : "none",
                }}
              >
                {plan.badge && (
                  <div className="inline-flex mb-3">
                    <span style={{ background: "#B07B34", color: "#FEFCF9", fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 20, padding: "4px 12px" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#A89A8A", marginBottom: 10 }}>{plan.name}</p>
                <div className="mb-1">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 44, color: "#2F2D2A" }}>{plan.price}</span>
                </div>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#A89A8A", marginBottom: 8 }}>{plan.period}</p>
                {plan.description && <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "#6B6257", marginBottom: 20, lineHeight: 1.7 }}>{plan.description}</p>}
                <div className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5">
                      {f.included
                        ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B07B34" }} />
                        : <span className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ color: "#C4B9AE", fontSize: 14, fontWeight: 700 }}>–</span>}
                      <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: f.included ? "#6B6257" : "#C4B9AE" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <a href={plan.ctaLink}
                  className="block text-center py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: plan.highlight ? "#B07B34" : "transparent",
                    color: plan.highlight ? "#FEFCF9" : "#B07B34",
                    border: plan.highlight ? "none" : "1px solid rgba(176,123,52,0.4)",
                    fontFamily: "'Lato', sans-serif", fontWeight: 400,
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
              <div key={plan.id} className="rounded-2xl p-6 flex flex-col transition-all duration-300"
                style={{
                  background: plan.highlight ? "rgba(176,123,52,0.06)" : "rgba(216,195,165,0.04)",
                  border: plan.highlight ? "1.5px solid #B07B34" : "1px solid rgba(216,195,165,0.12)",
                  boxShadow: plan.highlight ? "0 0 40px rgba(176,123,52,0.12)" : "none",
                }}
              >
                {plan.badge && (
                  <div className="inline-flex mb-3">
                    <span style={{ background: "#B07B34", color: "#FEFCF9", fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", borderRadius: 20, padding: "4px 12px" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(216,195,165,0.5)", marginBottom: 8 }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 32, color: plan.highlight ? "#B07B34" : "#D8C3A5" }}>{plan.price}</span>
                  <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(216,195,165,0.5)" }}>{plan.period}</span>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#B07B34" }} />
                      <span style={{ fontFamily: "'Lato', sans-serif', fontWeight: 300, fontSize: 12, color: 'rgba(216,195,165,0.7)'" }}>{f}</span>
                    </div>
                  ))}
                  {plan.excluded?.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <span style={{ color: "#6B6257", fontSize: 14, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>–</span>
                      <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#6B6257" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/B2BRegister"
                  className="block text-center py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    background: plan.highlight ? "#B07B34" : "transparent",
                    color: plan.highlight ? "#FEFCF9" : "#B07B34",
                    border: plan.highlight ? "none" : "1px solid rgba(176,123,52,0.4)",
                    fontFamily: "'Lato', sans-serif", fontWeight: 400,
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          {tab === "b2c" && (
            <>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(216,195,165,0.35)" }}>Einmalige Zahlung · Gedenkseite bleibt dauerhaft online · Keine versteckten Kosten</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(216,195,165,0.35)", marginTop: 4 }}>Zahlung per Kreditkarte, PayPal oder SEPA-Lastschrift</p>
            </>
          )}
          {tab === "b2b" && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(216,195,165,0.35)" }}>Alle B2B-Preise zzgl. MwSt. · Monatlich kündbar · Zahlung per SEPA oder Kreditkarte</p>
          )}
        </div>
      </div>
    </section>
  );
}