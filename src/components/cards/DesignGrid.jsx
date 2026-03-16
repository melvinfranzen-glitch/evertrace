import { Loader2, Check } from "lucide-react";

const styleLabels = ["Aquarell & Botanik", "Lichtspiel & Abstrakt", "Lebensbaum & Natur", "Minimalistisch & Elegant"];

export default function DesignGrid({ designs, selected, onSelect, generating }) {
  if (generating) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h3 className="font-semibold text-gray-800 text-lg mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Designs werden generiert…
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100">
              {designs[i] ? (
                <img src={designs[i]} alt={styleLabels[i]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-stone-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-xs">{styleLabels[i]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!designs.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold text-gray-800 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Design auswählen
        </h3>
        <p className="text-sm text-gray-500 mt-1">Klicken Sie auf Ihr bevorzugtes Design, um es anzupassen.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {designs.map((url, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="relative group aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200"
            style={{ borderColor: selected === i ? "#c9a84c" : "transparent" }}
          >
            <img src={url} alt={styleLabels[i]} className="w-full h-full object-cover" />
            {/* Hover overlay */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${selected === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              style={{ background: "linear-gradient(to top, rgba(28,20,8,0.7) 0%, transparent 60%)" }}>
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <p className="text-white text-xs font-medium">{styleLabels[i]}</p>
              </div>
            </div>
            {selected === i && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "#c9a84c" }}>
                <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}