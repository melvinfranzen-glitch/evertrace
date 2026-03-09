import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroLanding() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #1c1917 0%, #292524 40%, #3b2a1a 100%)",
      }}
    >
      {/* Decorative gold orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #c9a84c, transparent)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #b45309, transparent)" }} />
        <div className="absolute top-0 right-0 w-full h-full opacity-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
      </div>

      <div className="relative text-center px-6 max-w-4xl mx-auto fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px w-16" style={{ background: "#c9a84c" }} />
          <span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: "#c9a84c" }}>Digitale Gedenkkultur</span>
          <div className="h-px w-16" style={{ background: "#c9a84c" }} />
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Erinnern.
          <br />
          <span style={{ color: "#c9a84c" }}>Erzählen.</span>
          <br />
          Bewahren.
        </h1>

        <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Evertrace verbindet das Erbe geliebter Menschen mit moderner Technologie — 
          durch KI-gestützte Biografien, digitale Gedenkseiten und eine Brücke zu physischen Erinnerungsstücken.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => window.location.href = createPageUrl("Dashboard")}
            className="text-white px-8 py-6 text-base rounded-full shadow-xl"
            style={{ background: "linear-gradient(135deg, #b45309, #92400e)" }}
          >
            <Heart className="w-5 h-5 mr-2" />
            Gedenkseite erstellen
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base rounded-full border-stone-500 text-stone-200 hover:bg-white/10 bg-transparent"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Mehr erfahren
          </Button>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-10 text-stone-400 text-sm">
          <div className="text-center">
            <p className="text-2xl font-semibold text-white mb-1">KI-Biografie</p>
            <p>GPT-gestützte Lebensgeschichten</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-white mb-1">QR-Plaketten</p>
            <p>Messing, Schiefer, Edelstahl</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-white mb-1">DSGVO-konform</p>
            <p>In Deutschland gehostet</p>
          </div>
        </div>
      </div>

      <button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-400 hover:text-white transition-colors animate-bounce"
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </section>
  );
}