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
              background: isHighlight ? "rgba(201,169,110,0.05)" : isSelected ? "rgba(201,169,110,0.06)" : "#181714",
              border: isHighlight
                ? `1.5px solid #c9a96e`
                : isSelected
                ? "1.5px solid #c9a96e"
                : "1px solid #302d28",
            }}
          >
            {/* Empfohlen badge */}
            {isHighlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap z-10"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                ✦ {plan.badge}
              </div>
            )}

            <div className={`p-6 flex flex-col flex-1 ${isHighlight ? "pt-7" : ""}`}>
              <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-3xl font-bold" style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{plan.price}</span>
                <span className="text-sm" style={{ color: "#8a8278" }}>{plan.period}</span>
              </div>
              <p className="text-xs mb-1" style={{ color: "#5a554e" }}>{plan.vat}</p>
              <p className="text-sm mb-5" style={{ color: "#8a8278" }}>{plan.description}</p>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-snug">
                    {f.included
                      ? <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#7a9688" }} />
                      : <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#5a554e" }} />
                    }
                    <span style={{ color: f.included ? "#d4c5a9" : "#5a554e" }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {onSelect && (
                <button
                  className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isSelected ? "#c9a96e" : isHighlight ? "rgba(201,169,110,0.15)" : "#201e1a",
                    color: isSelected ? "#0f0e0c" : "#c9a96e",
                    border: `1px solid ${isSelected || isHighlight ? "#c9a96e" : "#302d28"}`,
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