import { Check, Crown, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const plans = [
  {
    id: "free",
    name: "Basic",
    badge: null,
    price: "Kostenlos",
    period: "14 Tage",
    desc: "Zum Testen und Kennenlernen",
    features: [
      "Digitale Gedenkseite (14 Tage)",
      "KI-Biografie-Generator",
      "Kondolenzbuch (max. 10 Einträge)",
      "QR-Code als PNG",
    ],
    cta: "Kostenlos starten",
    highlight: false,
    color: "#6b7280",
  },
  {
    id: "classic",
    name: "Evertrace Classic",
    badge: "Beliebt",
    price: "€ 79",
    period: "einmalig",
    desc: "Lebenslanges digitales Erbe",
    features: [
      "Lebenslanges Hosting",
      "KI-Biografie-Generator",
      "Unbegrenzte Kondolenzeinträge",
      "QR-Code als SVG & PNG",
      "Galerie (bis zu 50 Bilder)",
      "Spotify-Integration",
      "Virtuelle Kerzen",
    ],
    cta: "Jetzt sichern",
    highlight: true,
    color: "#b45309",
  },
  {
    id: "premium",
    name: "Evertrace Premium",
    badge: null,
    price: "€ 149",
    period: "einmalig",
    desc: "Das komplette Erinnerungspaket",
    features: [
      "Alles aus Classic",
      "KI-Trauerkarten-Design (4 Unikate)",
      "PDF-Export Kondolenzbuch",
      "Passwortschutz & Private Seite",
      "Unbegrenzte Galerie",
      "Premium-Support",
    ],
    cta: "Premium wählen",
    highlight: false,
    color: "#6d28d9",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "#b45309" }}>Preise</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Transparent & fair
          </h2>
          <p className="mt-4 text-gray-500 max-w-lg mx-auto font-light">
            Keine versteckten Kosten, keine Abonnements. Einmalig zahlen, dauerhaft erinnern.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 border-2 transition-all ${
                plan.highlight
                  ? "border-amber-500 shadow-xl shadow-amber-100 scale-105"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
              style={plan.highlight ? { background: "linear-gradient(160deg, #fffbf5, #fff)" } : {}}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#b45309" }}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === "premium" ? <Crown className="w-4 h-4" style={{ color: plan.color }} /> : 
                   plan.id === "classic" ? <Star className="w-4 h-4" style={{ color: plan.color }} /> : null}
                  <p className="text-sm font-medium text-gray-500">{plan.name}</p>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-sm text-gray-400 pb-1">/ {plan.period}</span>
                </div>
                <p className="text-sm text-gray-500">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full rounded-xl py-5"
                style={
                  plan.highlight
                    ? { background: "#b45309", color: "white" }
                    : { background: "#f5f5f4", color: "#374151" }
                }
                onClick={() => window.location.href = createPageUrl("Dashboard")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Physical Add-on */}
        <div className="rounded-2xl p-8 border border-stone-200 bg-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#c9a84c20" }}>
            <Package className="w-8 h-8" style={{ color: "#c9a84c" }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-gray-800 text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Physisches Add-on: Messing-Plakette
            </h3>
            <p className="text-gray-500 text-sm">
              Hochwertige gravierte QR-Plakette aus Messing, Schiefer oder Edelstahl inkl. Versand. 
              Direkt am Grabstein oder Urne anbringbar.
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-3xl font-bold text-gray-800 mb-1">€ 89</p>
            <p className="text-sm text-gray-400 mb-3">inkl. MwSt. & Versand</p>
            <Button
              size="sm"
              className="rounded-xl text-white"
              style={{ background: "#c9a84c" }}
              onClick={() => window.location.href = createPageUrl("Shop")}
            >
              Zur Plakette
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}