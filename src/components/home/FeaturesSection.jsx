import { Sparkles, QrCode, BookOpen, Music, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "KI-Biografie-Generator",
    desc: "Geben Sie Erinnerungen und Fakten ein – unsere KI verfasst daraus eine würdevolle, individuelle Lebensgeschichte in Ihrem gewählten Stil.",
    color: "#b45309",
  },
  {
    icon: QrCode,
    title: "QR-Code auf Plaketten",
    desc: "Hochwertige Messing-, Schiefer- und Edelstahlplaketten mit individuellem QR-Code für Grabstein, Urne oder Trauerkarte.",
    color: "#4a5568",
  },
  {
    icon: BookOpen,
    title: "Digitales Kondolenzbuch",
    desc: "Freunde und Familie können Kondolenznachrichten hinterlassen, die von Ihnen moderiert und als PDF-Hardcover gedruckt werden können.",
    color: "#b45309",
  },
  {
    icon: Heart,
    title: "Virtuelle Kerzen",
    desc: "Hinterbliebene können jederzeit eine virtuelle Kerze entzünden und eine persönliche Nachricht hinterlassen.",
    color: "#dc2626",
  },
  {
    icon: Music,
    title: "Spotify-Integration",
    desc: "Binden Sie die Lieblingslieder oder Playlist der verstorbenen Person direkt in die Gedenkseite ein.",
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "DSGVO-konform & sicher",
    desc: "Alle Daten werden sicher in Deutschland gespeichert. Private Gedenkseiten können mit Passwort geschützt werden.",
    color: "#4a5568",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "#b45309" }}>Funktionen</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ein würdevolles Erbe schaffen
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg font-light">
            Alles, was Sie brauchen, um die Erinnerung an einen geliebten Menschen zu bewahren und zu teilen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-stone-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}18` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
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