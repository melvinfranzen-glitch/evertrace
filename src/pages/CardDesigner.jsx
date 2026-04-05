import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Download, ShoppingCart, Loader2, Eye } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import CardContextForm from "@/components/cards/CardContextForm";
import DesignGrid from "@/components/cards/DesignGrid";
import CardTextEditor from "@/components/cards/CardTextEditor";
import CardPreview from "@/components/cards/CardPreview";
import CardDesignControls, { DEFAULT_SETTINGS } from "@/components/cards/CardDesignControls";

const STYLE_PROMPTS = [
  "Full-bleed seamless background artwork, portrait 3:4 ratio. Soft watercolor botanical art filling the entire frame edge to edge, delicate flowers and leaves, warm muted tones of beige, sage green and dusty rose. NO text, NO letters, NO borders, NO frames, NO card mockup. Pure artistic background texture, high resolution.",
  "Full-bleed seamless background artwork, portrait 3:4 ratio. Abstract light rays filtering through dense fog in a forest, golden hour warm light, dreamy ethereal atmosphere filling the entire frame edge to edge. NO text, NO letters, NO borders, NO frames, NO card mockup. Photorealistic, high resolution.",
  "Full-bleed seamless background artwork, portrait 3:4 ratio. Stylized ancient oak tree silhouette against a dark moody sky, golden leaves gently falling, painterly brushstrokes filling the entire frame edge to edge. NO text, NO letters, NO borders, NO frames, NO card mockup. Elegant, high resolution.",
  "Full-bleed seamless background artwork, portrait 3:4 ratio. Minimalist geometric gold lines (#c9a96e) on deep charcoal background (#1a1715), subtle paper texture filling the entire frame edge to edge. NO text, NO letters, NO borders, NO frames, NO card mockup. Luxury aesthetic, high resolution.",
];

export default function CardDesigner() {
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [previewSide, setPreviewSide] = useState("front");
  const [showQr, setShowQr] = useState(true);
  const [designSettings, setDesignSettings] = useState(DEFAULT_SETTINGS);
  const [texts, setTexts] = useState({
    name: "", birth: "", death: "", quote: "", body: "", font: "Cormorant Garamond",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { navigate(createPageUrl("Dashboard")); return; }
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
          font: "Cormorant Garamond",
        });
      }
      setLoading(false);
    });
  }, []);

  const handleGenerate = async ({ occasion, elements, quote }) => {
    setGenerating(true);
    setDesigns([]);
    setSelectedDesign(null);

    const contextPrompt = `Thematic context: remembrance of ${memorial?.name}, occasion: ${occasion}. ${elements ? `Incorporate elements: ${elements}.` : ""} REMINDER: Generate ONLY a full-bleed background image — NO text, NO card mockup, NO borders, NO frames.`;

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

  const handleExportPDF = async () => {
    const el = document.getElementById('card-preview-container');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [105, 148] });
    pdf.addImage(imgData, 'JPEG', 0, 0, 105, 148);
    pdf.save(`Trauerkarte_${texts.name || 'Evertrace'}.pdf`);
  };

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
              <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
                onClick={() => navigate(createPageUrl("Shop"))}
              >
                <ShoppingCart className="w-4 h-4 mr-1" /> Drucken lassen
              </Button>
              <Button
                size="sm"
                className="rounded-xl text-xs text-white"
                style={{ background: "linear-gradient(135deg, #c9a84c, #a07830)", color: "#1c1917" }}
                onClick={handleExportPDF}
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
            <div className="mt-4">
              <CardDesignControls
                settings={designSettings}
                onChange={setDesignSettings}
                hasPortrait={!!memorial?.hero_image_url}
                variant="compact"
              />
            </div>

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
                  <span style={{ color: "#c9a96e" }}>€ 59,–</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
                <div id="card-preview-container">
                  <CardPreview
                    bgImage={currentBg}
                    texts={texts}
                    showQr={showQr}
                    side={previewSide}
                    memorial={memorial}
                    designSettings={designSettings}
                  />
                </div>
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