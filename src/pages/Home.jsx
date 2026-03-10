import HeroLanding from "@/components/home/HeroLanding";
import FeaturesSection from "@/components/home/FeaturesSection";
import PricingSection from "@/components/home/PricingSection";
import CardTeaser from "@/components/home/CardTeaser";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div>
      <HeroLanding />
      <FeaturesSection />
      <CardTeaser />
      <PricingSection />
      <TestimonialsSection />

      {/* Final CTA */}
      <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1a1410, #231a0e)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-8"
            style={{ background: "rgba(201,168,76,0.1)", border: "1.5px solid rgba(201,168,76,0.2)" }}>
            <Heart className="w-6 h-6" style={{ color: "#c9a84c" }} />
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Jedes Leben verdient ein würdevolles Andenken
          </h2>
          <p className="text-stone-400 mb-10 font-light text-lg leading-relaxed">
            Beginnen Sie noch heute und schaffen Sie ein dauerhaftes digitales Erbe.
          </p>
          <button
            onClick={() => window.location.href = "/Dashboard"}
            className="px-12 py-4 rounded-full font-medium text-base transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #a07830)",
              color: "#1c1917",
              boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 32px rgba(201,168,76,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,168,76,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Kostenlos starten
          </button>
        </div>
      </section>
    </div>
  );
}