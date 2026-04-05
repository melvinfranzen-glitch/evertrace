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
    copy: "Halten Sie die Verbindung mit einer hochwertigen Grabplakette mit QR-Code fest. Besucher gelangen mit ihrem Handy direkt zur Gedenkseite.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: "#EDE3D3" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 11, color: "#B07B34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
            Der Weg zum Gedenken
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 40, color: "#2F2D2A", lineHeight: 1.1 }}>
            Drei Schritte zur Erinnerung
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {narratives.map((n) => (
            <div key={n.headline} className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(176,123,52,0.1)", border: "1.5px solid rgba(176,123,52,0.3)" }}
              >
                <n.icon className="w-7 h-7" style={{ color: "#B07B34", strokeWidth: 1.5 }} />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, color: "#2F2D2A", marginBottom: 14 }}>
                {n.headline}
              </h3>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, color: "#6B6257", lineHeight: 1.8 }}>{n.copy}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href={createPageUrl("Dashboard")}
            className="px-10 py-4 rounded-full text-sm transition-all duration-200"
            style={{ background: "rgba(176,123,52,0.12)", color: "#B07B34", border: "1px solid rgba(176,123,52,0.3)", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,123,52,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(176,123,52,0.12)"; }}
          >
            Gedenkseite erstellen — kostenlos
          </a>
        </div>
      </div>
    </section>
  );
}