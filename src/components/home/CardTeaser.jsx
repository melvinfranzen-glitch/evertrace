import { Sparkles, CreditCard } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CardTeaser() {
  return (
    <section className="py-20 px-6" style={{ background: "#F7F3ED" }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row"
          style={{ background: "linear-gradient(160deg, #3D3326 0%, #2A2218 55%, #1E1A14 100%)" }}>

          {/* Text side */}
          <div className="flex-1 p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: "#B07B34" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#B07B34", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
                Neu · KI-Trauerkarten
              </span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 36, color: "#F7F3ED", lineHeight: 1.12, marginBottom: 16 }}>
              Trauerkarten, die wirklich berühren.
            </h2>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(216,195,165,0.65)", lineHeight: 1.8, maxWidth: 460, marginBottom: 24 }}>
              Unsere KI liest die Geschichte eines Menschen und schreibt einen Text, der sich anfühlt, als wäre er von der Familie selbst verfasst. Sieben Motive, druckfertig, innerhalb von Minuten.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["7 einzigartige Motive", "KI-personalisierter Text", "PDF-Export", "Druck & Versand"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "rgba(176,123,52,0.12)", color: "#B07B34", border: "1px solid rgba(176,123,52,0.25)", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => window.location.href = createPageUrl("Dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm self-start transition-all duration-200"
              style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#7A5520"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#B07B34"; e.currentTarget.style.transform = ""; }}
            >
              <CreditCard className="w-4 h-4" />
              Jetzt Trauerkarte erstellen
            </button>
            <a href="/B2BRegister" className="mt-3 text-xs self-start" style={{ color: "#B07B34", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
              Sie sind Bestatter? Zur B2B-Plattform →
            </a>
          </div>

          {/* Visual side */}
          <div className="md:w-80 relative hidden md:flex items-center justify-center p-10">
            <div className="relative w-48">
              <div className="absolute -right-6 top-4 w-40 h-56 rounded-xl rotate-6 overflow-hidden shadow-xl opacity-60"
                style={{ background: "linear-gradient(135deg, #4a3520, #2d1f0a)" }}>
                <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&q=70" alt="" className="w-full h-full object-cover opacity-40" />
              </div>
              <div className="absolute -right-3 top-2 w-40 h-56 rounded-xl rotate-3 overflow-hidden shadow-xl opacity-80"
                style={{ background: "linear-gradient(135deg, #3d2a14, #1c1410)" }}>
                <img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=70" alt="" className="w-full h-full object-cover opacity-50" />
              </div>
              <div className="relative w-40 h-56 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(160deg, #2d1f0a, #1a1410)" }}>
                <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80" alt="" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,10,2,0.8) 0%, transparent 50%)" }} />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#F7F3ED" }}>Maria Schmidt</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 11, color: "rgba(216,195,165,0.6)" }}>1942 — 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}