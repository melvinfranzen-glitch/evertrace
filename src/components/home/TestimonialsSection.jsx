import { createPageUrl } from "@/utils";
import { Heart, Mail, Sparkles } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(160deg, #1a1410, #231a0e)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#c9a96e" }}>
          Early Access
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-white mb-5 leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Werden Sie Teil der ersten Gemeinschaft
        </h2>
        <p className="text-stone-400 font-light max-w-xl mx-auto leading-relaxed text-base mb-12">
          Evertrace befindet sich im Aufbau. Wir suchen die ersten Familien und Bestattungshäuser, die gemeinsam mit uns eine neue Form des digitalen Gedenkens gestalten möchten.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {[
            { icon: Heart, title: "Kostenlos starten", desc: "Erstellen Sie eine vollständige Gedenkseite ohne Kosten — und entscheiden Sie später, ob Sie erweitern möchten." },
            { icon: Sparkles, title: "KI-Biografie inklusive", desc: "Unser Biografie-Assistent hilft Ihnen, die richtigen Worte zu finden — einfühlsam und persönlich." },
            { icon: Mail, title: "Persönliche Begleitung", desc: "In der Early-Access-Phase stehen wir Ihnen direkt zur Seite. Schreiben Sie uns jederzeit." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-6 text-left"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,110,0.15)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.2)" }}>
                <Icon className="w-5 h-5" style={{ color: "#c9a96e" }} />
              </div>
              <p className="font-semibold text-white text-base mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{title}</p>
              <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <a
          href={createPageUrl("Dashboard")}
          className="inline-block px-10 py-4 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #c9a96e, #a07830)",
            color: "#1c1917",
            boxShadow: "0 4px 20px rgba(201,169,110,0.30)",
          }}
        >
          Jetzt kostenlos starten
        </a>
        <p className="mt-4 text-xs" style={{ color: "#5a554e" }}>
          Kein Kreditkarteneintrag erforderlich · Jederzeit kündbar
        </p>
      </div>
    </section>
  );
}