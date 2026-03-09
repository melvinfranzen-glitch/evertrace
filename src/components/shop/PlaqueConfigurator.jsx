import { useState } from "react";
import { QrCode } from "lucide-react";

const MATERIALS = [
  {
    id: "plaque_brass",
    label: "Messing",
    desc: "Klassisch & edel",
    price: 89,
    fill: "#c9a84c",
    stroke: "#a67c2e",
    textFill: "#5c3d00",
    tag: "Bestseller",
  },
  {
    id: "plaque_slate",
    label: "Schiefer",
    desc: "Modern & natürlich",
    price: 79,
    fill: "#4a5568",
    stroke: "#2d3748",
    textFill: "#e2e8f0",
    tag: null,
  },
  {
    id: "plaque_steel",
    label: "Edelstahl",
    desc: "Zeitlos & robust",
    price: 99,
    fill: "#a0aec0",
    stroke: "#718096",
    textFill: "#1a202c",
    tag: "Premium",
  },
];

export default function PlaqueConfigurator({ memorial, selected, onSelect }) {
  const mat = MATERIALS.find((m) => m.id === selected) || MATERIALS[0];

  return (
    <div className="space-y-6">
      {/* Material selector */}
      <div className="grid grid-cols-3 gap-3">
        {MATERIALS.map((m) => (
          <div
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
            style={{
              borderColor: selected === m.id ? "#b45309" : "#e5e7eb",
              background: selected === m.id ? "#fffbf5" : "white",
            }}
          >
            {m.tag && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold" style={{ background: "#b45309" }}>
                {m.tag}
              </span>
            )}
            <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: m.fill, border: `2px solid ${m.stroke}` }} />
            <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
            <p className="text-xs text-gray-400">{m.desc}</p>
            <p className="text-sm font-bold mt-1" style={{ color: "#b45309" }}>€ {m.price}</p>
          </div>
        ))}
      </div>

      {/* SVG Preview */}
      <div className="flex justify-center">
        <svg width="320" height="180" viewBox="0 0 320 180" className="rounded-2xl shadow-lg">
          {/* Plaque background */}
          <rect x="10" y="10" width="300" height="160" rx="12" fill={mat.fill} stroke={mat.stroke} strokeWidth="3" />
          
          {/* Texture overlay for realism */}
          {mat.id === "plaque_brass" && (
            <>
              <rect x="10" y="10" width="300" height="160" rx="12" fill="url(#brassGrad)" />
              <defs>
                <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8c564" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#c9a84c" stopOpacity="0" />
                  <stop offset="100%" stopColor="#9a7a30" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </>
          )}

          {/* Left decorative border */}
          <rect x="20" y="20" width="4" height="140" rx="2" fill={mat.stroke} opacity="0.5" />
          <rect x="296" y="20" width="4" height="140" rx="2" fill={mat.stroke} opacity="0.5" />

          {/* Name */}
          <text x="160" y="68" textAnchor="middle" fill={mat.textFill} fontFamily="Georgia, serif" fontSize="20" fontWeight="bold">
            {memorial?.name || "Maria Müller"}
          </text>

          {/* Dates */}
          <text x="160" y="92" textAnchor="middle" fill={mat.textFill} fontFamily="Georgia, serif" fontSize="12" opacity="0.8">
            {memorial?.birth_date ? memorial.birth_date.substring(0, 4) : "1945"} – {memorial?.death_date ? memorial.death_date.substring(0, 4) : "2024"}
          </text>

          {/* Divider */}
          <line x1="80" y1="105" x2="200" y2="105" stroke={mat.textFill} strokeWidth="0.8" opacity="0.4" />

          {/* QR placeholder */}
          <rect x="228" y="110" width="50" height="50" rx="6" fill="white" opacity="0.9" />
          <text x="253" y="141" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="sans-serif">QR</text>

          {/* Subtitle */}
          <text x="155" y="135" textAnchor="middle" fill={mat.textFill} fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" opacity="0.75">
            {memorial?.subtitle ? `„${memorial.subtitle.substring(0, 28)}"` : "„In liebevoller Erinnerung""}
          </text>

          {/* evertrace watermark */}
          <text x="160" y="158" textAnchor="middle" fill={mat.textFill} fontFamily="Georgia, serif" fontSize="8" opacity="0.45" letterSpacing="2">
            EVERTRACE
          </text>
        </svg>
      </div>

      <p className="text-center text-xs text-gray-400">Vorschau des gravierten {mat.label}-Schilds (Maße: 20 × 11 cm)</p>
    </div>
  );
}