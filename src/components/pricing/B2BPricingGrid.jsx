import { Check, X } from "lucide-react";
import { B2B_PLANS } from "./pricingData";

export default function B2BPricingGrid({ selectedPlan, onSelect, compact = false }) {
  return (
    <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>
      {/* On mobile, show Premium first */}
      {[...B2B_PLANS].sort((a, b) => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          if (a.highlight) return -1;
          if (b.highlight) return 1;
        }
        return 0;
      }).map(plan => {
        const isSelected = selectedPlan === plan.id;
        const isHighlight = plan.highlight;
        return (
          <div
            key={plan.id}
            onClick={() => onSelect && onSelect(plan.id)}
            className={`relative rounded-2xl flex flex-col ${onSelect ? "cursor-pointer" : ""} transition-all`}
            style={{
              background: isHighlight ? "rgba(176,123,52,0.06)" : isSelected ? "rgba(176,123,52,0.05)" : "rgba(216,195,165,0.04)",
              border: isHighlight
                ? `1.5px solid #B07B34`
                : isSelected
                ? "1.5px solid #B07B34"
                : "1px solid rgba(216,195,165,0.12)",
            }}
          >
            {/* Empfohlen badge */}
            {isHighlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap z-10"
                style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 10 }}>
                ✦ {plan.badge}
              </div>
            )}

            <div className={`p-6 flex flex-col flex-1 ${isHighlight ? "pt-7" : ""}`}>
              <h3 className="text-xl mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: "#D8C3A5" }}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-0.5">
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 32, color: "#D8C3A5" }}>{plan.price}</span>
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(216,195,165,0.5)" }}>{plan.period}</span>
              </div>
              <p className="text-xs mb-1" style={{ color: "rgba(216,195,165,0.4)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{plan.vat}</p>
              <p className="text-sm mb-5" style={{ color: "rgba(216,195,165,0.55)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{plan.description}</p>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-snug">
                    {f.included
                      ? <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#B07B34" }} />
                      : <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#6B6257" }} />
                    }
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: f.included ? "rgba(216,195,165,0.7)" : "#6B6257" }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {onSelect && (
                <button
                  className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isSelected ? "#B07B34" : isHighlight ? "rgba(176,123,52,0.15)" : "transparent",
                    color: isSelected ? "#F7F3ED" : "#B07B34",
                    border: `1px solid ${isSelected || isHighlight ? "#B07B34" : "rgba(176,123,52,0.3)"}`,
                    fontFamily: "'Lato', sans-serif", fontWeight: 400,
                  }}
                >
                  {isSelected ? "✓ Gewählt" : plan.cta}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}