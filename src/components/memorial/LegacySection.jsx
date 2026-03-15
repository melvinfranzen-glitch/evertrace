import { Briefcase, Users, MessageSquare, Lightbulb, Flame, Trophy } from "lucide-react";

const CATEGORIES = {
  beruf:        { label: "Berufliches",    icon: Briefcase,     color: "#93c5fd" },
  ehrenamt:     { label: "Ehrenamt",       icon: Users,         color: "#6ee7b7" },
  zitat:        { label: "Lieblingszitat", icon: MessageSquare, color: "#fcd34d" },
  ratschlag:    { label: "Ratschläge",     icon: Lightbulb,     color: "#fdba74" },
  leidenschaft: { label: "Leidenschaft",   icon: Flame,         color: "#fca5a5" },
  leistung:     { label: "Errungenschaft", icon: Trophy,        color: "#c4b5fd" },
};

export default function LegacySection({ entries }) {
  if (!entries?.length) return null;

  return (
    <section className="py-20 px-6" style={{ background: "white" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Vermächtnis</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Lebenswerk & Werte
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {entries.map(entry => {
            const cat = CATEGORIES[entry.category] || CATEGORIES.leistung;
            const Icon = cat.icon;
            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${cat.color}` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.color + "33" }}>
                    <Icon className="w-4 h-4" style={{ color: cat.color !== "#fcd34d" ? cat.color : "#a16207" }} />
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{cat.label}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {entry.title}
                </h3>
                {entry.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{entry.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}