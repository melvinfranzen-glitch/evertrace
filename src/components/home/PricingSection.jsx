import { Brain, QrCode, Image, Star, Crown, Package, Check, Clock, FileText, Lock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const featureIcons = {
  "Schreibassistent für die Lebensgeschichte": Brain,
  "Persönlicher QR-Code als SVG & PNG": QrCode,
  "Persönlicher QR-Code": QrCode,
  "Fotogalerie (bis zu 50 Aufnahmen)": Image,
  "Unbegrenzte Fotogalerie": Image,
  "Schutzraum für Ihr digitales Vermächtnis": Clock,
  "Kondolenzbuch als druckbares PDF": FileText,
  "Privater, passwortgeschützter Gedenkraum": Lock,
  "Persönliche Betreuung": Headphones,
};

const plans = [
  {
    id: "free",
    name: "Basic",
    badge: null,
    price: "Kostenlos",
    period: "14 Tage testen",
    desc: "Zum Kennenlernen",
    features: [
      "Gedenkseite zum Kennenlernen (14 Tage)",
      "Schreibassistent für die Lebensgeschichte",
      "Kondolenzbuch (bis zu 10 Beileidsbekundungen)",
      "Persönlicher QR-Code",
    ],
    cta: "Kostenlos erkunden",
    highlight: false,
    color: "#6b7280",
  },
  {
    id: "classic",
    name: "Classic",
    badge: "Beliebteste Wahl",
    price: "€ 79",
    period: "einmalig",
    desc: "Einmal zahlen, f\u00FCr immer bewahren.",
    features: [
      "Schreibassistent für die Lebensgeschichte",
      "Schutzraum für Ihr digitales Vermächtnis",
      "Ein offenes Buch für alle Beileidsbekundungen",
      "Persönlicher QR-Code als SVG & PNG",
      "Fotogalerie (bis zu 50 Aufnahmen)",
      "Lieblingsmusik & virtuelle Kerzen",
    ],
    cta: "Erinnerung jetzt gestalten",
    highlight: true,
    color: "#b45309",
  },
  {
    id: "premium",
    name: "Premium",
    badge: null,
    price: "€ 149",
    period: "einmalig",
    desc: "Alles inklusive, keinerlei Kompromisse.",
    features: [
      "Alles aus Classic",
      "Individuelle Gestaltungshilfe für Ihre Trauerpost (4 Motive)",
      "Kondolenzbuch als druckbares PDF",
      "Privater, passwortgeschützter Gedenkraum",
      "Unbegrenzte Fotogalerie",
      "Persönliche Betreuung",
    ],
    cta: "Vollständiges Erbe sichern",
    highlight: false,
    color: "#1e3a5f",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#b45309" }}>Preise</p>
          <h2
            className="text-4xl md:text-5xl font-semibold text-gray-800 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Das Vermächtnis bewahren
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto font-light leading-relaxed text-base">
            Einmalig zahlen — das Erbe bleibt für immer. Keine Abonnements, keine versteckten Kosten.
          </p>
        </div>

        {/* Pricing grid — extra top margin on classic for floating badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start" style={{ marginTop: "20px" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
              style={
                plan.highlight
                  ? {
                      background: "linear-gradient(160deg, #fffcf5, #fff)",
                      border: "2px solid #c9a84c",
                      boxShadow: "0 8px 40px rgba(201,168,76,0.22), 0 2px 12px rgba(201,168,76,0.12)",
                      marginTop: "-8px",
                    }
                  : plan.id === "premium"
                  ? { background: "#fff", border: "2px solid #1e3a5f22" }
                  : { background: "#fafaf8", border: "1.5px solid #e7e5e4" }
              }
            >
              {/* Floating badge */}
              {plan.badge && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #a07830)",
                    boxShadow: "0 3px 14px rgba(201,168,76,0.38)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "#1c1917",
                    textTransform: "uppercase",
                  }}
                >
                  ✦ {plan.badge}
                </div>
              )}

              <div className="p-7">
                {/* Plan name */}
                <div className="flex items-center gap-2 mb-4">
                  {plan.id === "premium" && <Crown className="w-4 h-4" style={{ color: plan.color }} />}
                  {plan.id === "classic" && <Star className="w-4 h-4" style={{ color: plan.color }} />}
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: plan.color }}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span
                    className="font-bold text-gray-900 leading-none"
                    style={{ fontSize: plan.price === "Kostenlos" ? "2rem" : "3.25rem" }}
                  >
                    {plan.price}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">{plan.period}</span>
                </div>
                <p className="text-base text-gray-500 mb-6">{plan.desc}</p>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => {
                    const Icon = featureIcons[f] || Check;
                    return (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 leading-snug">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${plan.color}14` }}
                        >
                          <Check className="w-3 h-3" style={{ color: plan.color }} strokeWidth={2.5} />
                        </span>
                        {f}
                      </li>
                    );
                  })}
                </ul>

                <Button
                  className="w-full rounded-xl py-5 font-medium transition-all duration-200"
                  style={
                    plan.highlight
                      ? { background: "linear-gradient(135deg, #c9a84c, #a07830)", color: "#1c1917", boxShadow: "0 6px 24px rgba(201,168,76,0.45), 0 2px 8px rgba(201,168,76,0.25)", fontWeight: 600 }
                      : plan.id === "premium"
                      ? { background: "#1e3a5f", color: "white", fontWeight: 600 }
                      : { background: "#f0ede8", color: "#57534e", fontWeight: 500 }
                  }
                  onClick={() => window.location.href = createPageUrl("Dashboard")}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { icon: "🔒", label: "SSL-verschlüsselt" },
            { icon: "🇩🇪", label: "Hosting in Deutschland" },
            { icon: "✅", label: "DSGVO-konform" },
            { icon: "💳", label: "Sichere Zahlung" },
          ].map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 text-xs text-stone-500 bg-white shadow-sm"
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Physical Add-on with mockup */}
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white flex flex-col md:flex-row">
          {/* Mockup image */}
          <div className="relative md:w-64 h-52 md:h-auto flex-shrink-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85"
              alt="Messing-Plakette Mockup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(28,22,8,0.3), transparent)" }} />
            <div className="absolute bottom-3 left-3">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,76,0.9)", color: "#1c1917" }}
              >
                Physisches Produkt
              </span>
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Package className="w-4 h-4" style={{ color: "#c9a84c" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a84c" }}>Add-on</span>
              </div>
              <h3
                className="font-semibold text-gray-800 text-xl mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Die digitale Brücke zum ewigen Gedenken
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Feinste Gravur in zeitlosem Messing, Schiefer oder Edelstahl — mit persönlichem QR-Code.
                An Grabstein, Urne oder Trauerkarte: eine stille Einladung zur Erinnerung.
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-4xl font-bold text-gray-800 mb-0.5">€ 89</p>
              <p className="text-xs text-gray-400 mb-4">inkl. MwSt. & Versand</p>
              <Button
                className="rounded-xl text-sm px-6 py-2.5 font-medium"
                style={{ background: "linear-gradient(135deg, #c9a84c, #a07830)", color: "#1c1917" }}
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