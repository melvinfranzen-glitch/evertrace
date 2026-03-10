import { Brain, QrCode, BookOpen, Flame, Music2, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Biografie-Assistent",
    desc: "Teilen Sie uns besondere Momente und Erinnerungen mit — gemeinsam finden wir die richtigen Worte für ein bewegtes Leben.",
  },
  {
    icon: QrCode,
    title: "QR-Code auf Plaketten",
    desc: "Hochwertige Messing-, Schiefer- und Edelstahlplaketten mit QR-Code für Grabstein, Urne oder Trauerkarte.",
  },
  {
    icon: BookOpen,
    title: "Digitales Kondolenzbuch",
    desc: "Freunde können Nachrichten hinterlassen, die Sie moderieren und als PDF-Hardcover drucken lassen können.",
  },
  {
    icon: Flame,
    title: "Virtuelle Kerzen",
    desc: "Hinterbliebene können jederzeit eine virtuelle Kerze entzünden und eine persönliche Nachricht hinterlassen.",
  },
  {
    icon: Music2,
    title: "Spotify-Integration",
    desc: "Binden Sie die Lieblingslieder der verstorbenen Person direkt in die Gedenkseite ein.",
  },
  {
    icon: ShieldCheck,
    title: "DSGVO-konform & sicher",
    desc: "Alle Daten werden sicher in Deutschland gespeichert. Private Gedenkseiten sind passwortgeschützt.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#b45309" }}>
            Funktionen
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold text-gray-800 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ein Platz für die Ewigkeit
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
            Alles, was Sie brauchen, um die Geschichte eines geliebten Menschen mit Würde zu bewahren — für Ihre Familie und alle, die trauern.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-stone-100 group cursor-default"
            >
              {/* Gold line icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7 transition-all duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #fef9ee, #fdf0d5)",
                  border: "1.5px solid rgba(201,168,76,0.25)",
                }}
              >
                <f.icon
                  className="w-6 h-6"
                  style={{ color: "#c9a84c", strokeWidth: 1.5 }}
                />
              </div>
              <h3
                className="font-semibold text-gray-800 text-lg mb-3 leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}