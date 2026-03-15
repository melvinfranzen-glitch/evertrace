import { Heart, Users, QrCode } from "lucide-react";
import { createPageUrl } from "@/utils";

const narratives = [
  {
    icon: Heart,
    headline: "Erinnern",
    copy: "Erstellen Sie eine digitale Gedenkseite mit Fotos, Lebensgeschichte und den Dingen, die ihn oder sie ausmachten. Eine dauerhafte Erinnerung, die immer zugänglich bleibt.",
  },
  {
    icon: Users,
    headline: "Teilen",
    copy: "Familie und Freunde können sich versammeln, um gemeinsam zu trauern. Nachrichten hinterlassen, virtuelle Kerzen entzünden und Erinnerungen miteinander bewahren.",
  },
  {
    icon: QrCode,
    headline: "Bewahren",
    copy: "Halten Sie die Verbindung mit einer hochweertigen Grabplakette mit QR-Code fest. Besucher gelangen mit ihrem Handy direkt zur Gedenkseite.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#c9a96e" }}>
            Der Weg zum Gedenken
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold text-gray-800 mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Drei Schritte zur Erinnerung
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {narratives.map((n) => (
            <div key={n.headline} className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "rgba(201,169,110,0.1)",
                  border: "1.5px solid rgba(201,169,110,0.3)",
                }}
              >
                <n.icon className="w-7 h-7" style={{ color: "#c9a96e", strokeWidth: 1.5 }} />
              </div>
              <h3
                className="font-semibold text-gray-800 text-xl mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {n.headline}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">{n.copy}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href={createPageUrl("Dashboard")}
            className="px-10 py-4 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(201,169,110,0.15)",
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,169,110,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(201,169,110,0.15)";
            }}
          >
            Gedenkseite kostenlos erstellen
          </a>
        </div>
      </div>
    </section>
  );
}