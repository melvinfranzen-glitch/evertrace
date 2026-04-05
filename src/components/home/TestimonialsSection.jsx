import { createPageUrl } from "@/utils";
import { Heart, Mail, Sparkles } from "lucide-react";

const QUOTES = [
  {
    quote: "Evertrace hat uns geholfen, die Erinnerung an unsere Mutter so zu bewahren, wie sie war — warmherzig, lebendig und voller Liebe.",
    name: "Familie Hoffmann",
    role: "Privatnutzerin",
  },
  {
    quote: "Als Bestatter schätze ich die würdevolle Gestaltung und die einfache Handhabung. Unsere Trauerfamilien sind dankbar für diese Möglichkeit.",
    name: "Markus Seidel",
    role: "Bestattungshaus Seidel, München",
  },
  {
    quote: "Die Lebensgeschichte hat genau das eingefangen, was wir über unseren Vater sagen wollten — poetisch und tief bewegend. Als hätte jemand ihm wirklich zugehört.",
    name: "Claudia Berger",
    role: "Tochter & Privatnutzerin",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "#F7F3ED" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 11, color: "#B07B34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
            Stimmen
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 40, color: "#2F2D2A", lineHeight: 1.1 }}>
            Was Familien & Bestatter sagen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {QUOTES.map(({ quote, name, role }) => (
            <div key={name}
              style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", borderRadius: 18, padding: "32px" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(47,45,42,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <span style={{ display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#D8C3A5", lineHeight: 1, marginBottom: 16 }}>❝</span>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 18, color: "#6B6257", lineHeight: 1.9 }}>
                {quote}
              </p>
              <div style={{ marginTop: 20 }}>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 13, color: "#2F2D2A" }}>{name}</p>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#A89A8A" }}>{role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={createPageUrl("Dashboard")}
            className="inline-block px-10 py-4 rounded-full text-sm transition-all duration-200"
            style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#7A5520"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#B07B34"; e.currentTarget.style.transform = ""; }}
          >
            Gedenkseite erstellen
          </a>
          <p className="mt-4 text-xs" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Kostenlos starten · Keine Verpflichtung
          </p>
        </div>
      </div>
    </section>
  );
}