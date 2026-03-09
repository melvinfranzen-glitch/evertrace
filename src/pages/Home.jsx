import HeroLanding from "@/components/home/HeroLanding";
import FeaturesSection from "@/components/home/FeaturesSection";
import PricingSection from "@/components/home/PricingSection";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div>
      <HeroLanding />
      <FeaturesSection />
      <PricingSection />

      {/* Final CTA */}
      <section className="py-24 px-6 text-center" style={{ background: "linear-gradient(160deg, #1c1917, #292524)" }}>
        <div className="max-w-2xl mx-auto">
          <Heart className="w-10 h-10 mx-auto mb-6" style={{ color: "#c9a84c" }} />
          <h2 className="text-4xl font-semibold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Jedes Leben verdient ein würdevolles Andenken
          </h2>
          <p className="text-stone-400 mb-8 font-light text-lg">
            Beginnen Sie noch heute und schaffen Sie ein dauerhaftes digitales Erbe.
          </p>
          <button
            onClick={() => window.location.href = "/Dashboard"}
            className="px-10 py-4 rounded-full text-white font-medium text-base transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #b45309, #92400e)" }}
          >
            Kostenlos starten
          </button>
        </div>
      </section>
    </div>
  );
}