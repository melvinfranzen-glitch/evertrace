import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Download, ShoppingCart, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardContextForm from "@/components/cards/CardContextForm";
import DesignGrid from "@/components/cards/DesignGrid";
import CardTextEditor from "@/components/cards/CardTextEditor";
import CardPreview from "@/components/cards/CardPreview";

const STYLE_PROMPTS = [
  "soft watercolor botanical art, delicate flowers and leaves, warm muted tones, beige and sage green, funeral memorial card background, no text, artistic",
  "abstract light rays through fog in a forest, golden hour, dreamy ethereal atmosphere, memorial card background, no text, photorealistic",
  "stylized ancient oak tree silhouette, golden leaves falling, dark sky, memorial card artwork, painterly, elegant, no text",
  "minimalist geometric gold lines on deep charcoal background, subtle texture, luxury memorial card design, no text, elegant",
];

export default function CardDesigner() {
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [previewSide, setPreviewSide] = useState("front");
  const [showQr, setShowQr] = useState(true);
  const [texts, setTexts] = useState({
    name: "", birth: "", death: "", quote: "", body: "", font: "Playfair Display",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = createPageUrl("Dashboard"); return; }
    base44.entities.Memorial.filter({ id }).then((results) => {
      if (results.length) {
        const m = results[0];
        setMemorial(m);
        setTexts({
          name: m.name || "",
          birth: m.birth_date ? m.birth_date.slice(0, 4) : "",
          death: m.death_date ? m.death_date.slice(0, 4) : "",
          quote: m.subtitle || "",
          body: "",
          font: "Playfair Display",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleGenerate = async ({ occasion, elements, quote }) => {
    setGenerating(true);
    setDesigns([]);
    setSelectedDesign(null);

    const contextPrompt = `Memorial card for ${memorial?.name}, ${occasion}. ${elements ? `Design elements: ${elements}.` : ""} High quality, premium, emotional, no text overlay.`;

    // Generate 4 designs sequentially, updating UI as each completes
    const results = [];
    for (let i = 0; i < 4; i++) {
      const prompt = `${STYLE_PROMPTS[i]} Context: ${contextPrompt}`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      results.push(url);
      setDesigns([...results]);
    }

    setGenerating(false);
    setSelectedDesign(0);
    if (quote) setTexts((p) => ({ ...p, quote }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    );
  }

  const currentBg = selectedDesign !== null ? designs[selectedDesign] : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Trauerkarte gestalten
              </h1>
              <p className="text-sm text-gray-500">für {memorial?.name}</p>
            </div>
          </div>
          {selectedDesign !== null && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => window.location.href = createPageUrl("Shop")}
              >
                <ShoppingCart className="w-4 h-4 mr-1" /> Drucken lassen
              </Button>
              <Button
                size="sm"
                className="rounded-xl text-xs text-white"
                style={{ background: "linear-gradient(135deg, #c9a84c, #a07830)", color: "#1c1917" }}
              >
                <Download className="w-4 h-4 mr-1" /> PDF exportieren
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Context form + design grid */}
          <div className="lg:col-span-1 space-y-6">
            <CardContextForm
              memorial={memorial}
              onGenerate={handleGenerate}
              generating={generating}
            />
            <DesignGrid
              designs={designs}
              selected={selectedDesign}
              onSelect={setSelectedDesign}
              generating={generating && designs.length < 4}
            />
          </div>

          {/* Middle: Text editor */}
          <div className="lg:col-span-1">
            <CardTextEditor
              texts={texts}
              onChange={setTexts}
              showQr={showQr}
              onToggleQr={() => setShowQr((p) => !p)}
            />

            {/* Paper / Print info */}
            {selectedDesign !== null && (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Druck-Optionen</h4>
                {[
                  ["Papiersorte", "Feinstpapier matt 350g"],
                  ["Format", "DIN A6 Klappkarte"],
                  ["Veredelung", "Goldfolienprägung (Name)"],
                  ["Lieferzeit", "5–7 Werktage"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-700 font-medium">{v}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">50 Karten inkl. Versand</span>
                  <span style={{ color: "#b45309" }}>€ 69</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Vorschau
                </h3>
                {/* Side toggle */}
                <div className="flex rounded-lg overflow-hidden border border-stone-200 text-xs">
                  {["front", "back"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPreviewSide(s)}
                      className="px-3 py-1.5 transition-all"
                      style={{
                        background: previewSide === s ? "#1c1917" : "white",
                        color: previewSide === s ? "white" : "#6b7280",
                      }}
                    >
                      {s === "front" ? "Vorderseite" : "Rückseite"}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDesign === null && !generating ? (
                <div className="aspect-[3/4] rounded-xl bg-stone-100 flex items-center justify-center">
                  <div className="text-center text-stone-400">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Vorschau erscheint hier</p>
                    <p className="text-xs mt-1">Design oben auswählen</p>
                  </div>
                </div>
              ) : (
                <CardPreview
                  bgImage={currentBg}
                  texts={texts}
                  showQr={showQr}
                  side={previewSide}
                  memorial={memorial}
                />
              )}

              {/* Info */}
              <p className="text-xs text-gray-400 text-center mt-4">
                DIN A6 · Klappkarte · Print-Ready PDF
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}