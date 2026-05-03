import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Monitor } from "lucide-react";
import CardPrintPreview from "@/components/b2b/CardPrintPreview";

export default function B2BCardPresentation() {
  const [ps, setPs] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [funeralHome, setFuneralHome] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    base44.entities.PresentationState.filter({ id }).then(async ([state]) => {
      if (!state) { setLoading(false); return; }
      setPs(state);
      const [caseRes, fhRes] = await Promise.all([
        state.case_id ? base44.entities.Case.filter({ id: state.case_id }) : Promise.resolve([]),
        state.funeral_home_id ? base44.entities.FuneralHome.filter({ id: state.funeral_home_id }) : Promise.resolve([]),
      ]);
      if (caseRes[0]) setCaseData(caseRes[0]);
      if (fhRes[0]) setFuneralHome(fhRes[0]);
      setLoading(false);
    });

    const unsub = base44.entities.PresentationState.subscribe((event) => {
      if (event.id === id && (event.type === "update" || event.type === "create")) {
        setPs(event.data);
      }
    });
    return () => unsub();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0f0e0c" }}>
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#c9a96e" }} />
    </div>
  );

  if (!ps) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "#0f0e0c" }}>
      <Monitor className="w-12 h-12" style={{ color: "#302d28" }} />
      <p style={{ color: "#5a554e", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>Warte auf Präsentation…</p>
    </div>
  );

  const { designs, selected_design_idx, edited_text, card_format, preview_side, hero_image_url, religion, step } = ps;
  const selIdx = selected_design_idx ?? 0;
  const side = preview_side || "front";

  // Step 1 → zeige alle 4 Designs als Grid
  if (step === 1 && designs && designs.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10" style={{ background: "#0f0e0c" }}>
        <p className="text-xs uppercase tracking-[0.3em] mb-8" style={{ color: "#c9a96e", fontFamily: "'Lato', sans-serif" }}>
          Design-Auswahl
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {designs.map((d, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Selected highlight ring */}
              {selIdx === i && (
                <div style={{
                  position: "absolute", inset: -4, borderRadius: 16,
                  border: "2px solid #c9a96e",
                  boxShadow: "0 0 24px rgba(201,169,110,0.4)",
                  zIndex: 1, pointerEvents: "none"
                }} />
              )}
              <div style={{ opacity: selIdx === i ? 1 : 0.55, transition: "opacity 0.4s" }}>
                <CardPrintPreview
                  caseData={caseData}
                  generatedText={edited_text}
                  motifImageUrl={d.motifUrl}
                  cardFormat={card_format || "DIN_A5_folded"}
                  side="front"
                  funeralHome={funeralHome}
                  heroImageUrl={i === selIdx ? hero_image_url : ""}
                  religion={religion}
                />
                <p className="mt-2 text-center text-xs" style={{ color: selIdx === i ? "#c9a96e" : "#5a554e", fontFamily: "'Lato', sans-serif" }}>
                  {d.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Alle anderen Steps → Außen- UND Innenseite nebeneinander groß
  const cardW = "min(380px, 38vw)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-10" style={{ background: "#0f0e0c" }}>
      <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#c9a96e", fontFamily: "'Lato', sans-serif" }}>
        Kartenvorschau
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full">
        {/* Außenseite */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#5a554e", fontFamily: "'Lato', sans-serif" }}>Außenseite</p>
          <div style={{ width: cardW }}>
            <CardPrintPreview
              caseData={caseData}
              generatedText={edited_text}
              motifImageUrl={designs?.[selIdx]?.motifUrl || ""}
              cardFormat={card_format || "DIN_A5_folded"}
              side="front"
              funeralHome={funeralHome}
              heroImageUrl={hero_image_url}
              religion={religion}
            />
          </div>
        </div>

        {/* Trennlinie */}
        <div style={{ width: 1, height: 200, background: "rgba(201,169,110,0.15)" }} className="hidden md:block" />

        {/* Innenseite */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#5a554e", fontFamily: "'Lato', sans-serif" }}>Innenseite</p>
          <div style={{ width: cardW }}>
            <CardPrintPreview
              caseData={caseData}
              generatedText={edited_text}
              motifImageUrl={designs?.[selIdx]?.motifUrl || ""}
              cardFormat={card_format || "DIN_A5_folded"}
              side="inside"
              funeralHome={funeralHome}
              heroImageUrl={hero_image_url}
              religion={religion}
            />
          </div>
        </div>
      </div>

      {designs?.[selIdx]?.label && (
        <p className="text-sm" style={{ color: "#8a8278", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          {designs[selIdx].label}
        </p>
      )}
    </div>
  );
}