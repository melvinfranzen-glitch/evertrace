import { useState } from "react";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const occasions = [
  "Einladung zur Trauerfeier",
  "Danksagung nach der Beerdigung",
  "Todesanzeige",
  "Jahrestag-Gedenken",
];

const suggestions = [
  "Lieblingsblume: Rosen", "Religiöses Symbol: Kreuz", "Lieblingsbaum: Eiche",
  "Motiv: Sonnenuntergang", "Stil: Aquarell", "Motiv: Lichtstrahlen",
  "Zitat von Goethe", "Motiv: Schmetterling", "Stil: Abstrakt & modern",
];

const quoteTemplates = [
  `\u201EIn unseren Herzen wirst du immer leben.\u201C`,
  `\u201ENicht Weinen, dass es vorbei ist \u2013 L\u00E4cheln, dass es gewesen ist.\u201C (Seuss)`,
  `\u201EDer Tod ist nichts anderes als ein \u00DCbergang.\u201C (Seneca)`,
  `\u201ELiebe kennt keine Grenzen \u2013 auch nicht die des Todes.\u201C`,
];

export default function CardContextForm({ memorial, onGenerate, generating }) {
  const [occasion, setOccasion] = useState(occasions[0]);
  const [elements, setElements] = useState("");
  const [quote, setQuote] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleSubmit = () => {
    onGenerate({ occasion, elements, quote });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Gestaltungs-Kontext
        </h3>
        <p className="text-sm text-gray-500">
          Die Texte werden automatisch auf Basis der Biografie und des Portraits von <strong>{memorial?.name}</strong> erstellt.
        </p>
      </div>

      {/* Occasion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Anlass</label>
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-gray-700 bg-white hover:border-amber-400 transition-colors"
          >
            {occasion}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {openDropdown && (
            <div className="absolute top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {occasions.map((o) => (
                <button
                  key={o}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  onClick={() => { setOccasion(o); setOpenDropdown(false); }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Elements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gewünschte Gestaltungselemente
        </label>
        <Textarea
          value={elements}
          onChange={(e) => setElements(e.target.value)}
          placeholder="z. B. Lieblingsblume Rosen, religiöses Kreuz-Symbol, warme Herbstfarben, Aquarell-Stil..."
          className="resize-none h-24 text-sm"
        />
        {/* Quick tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setElements((p) => p ? `${p}, ${s}` : s)}
              className="text-xs px-2.5 py-1 rounded-full border border-stone-200 text-gray-500 hover:border-amber-400 hover:text-amber-700 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zitat / Leitspruch <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <Textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Eigenes Zitat oder aus Vorschlägen wählen..."
          className="resize-none h-16 text-sm"
        />
        <div className="space-y-1 mt-2">
          {quoteTemplates.map((q) => (
            <button
              key={q}
              onClick={() => setQuote(q)}
              className="block w-full text-left text-xs px-3 py-2 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-800 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={generating}
        className="w-full py-5 rounded-xl text-base font-medium"
        style={{ background: "linear-gradient(135deg, #c9a96e, #a07830)", color: "#1c1917" }}
      >
        {generating ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 4 Designs werden generiert…</>
        ) : (
          <><Sparkles className="w-5 h-5 mr-2" /> 4 einzigartige Designs erstellen</>
        )}
      </Button>
    </div>
  );
}