import { useState, useRef } from "react";
import { Loader2, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CardPrintPreview from "./CardPrintPreview";

// DIN format dimensions in mm
const FORMAT_DIMS = {
  DIN_A5_folded: { w: 148, h: 210, label: "DIN A5 (148 × 210 mm)" },
  DIN_A6_landscape: { w: 148, h: 105, label: "DIN A6 quer (148 × 105 mm)" },
  DIN_lang_portrait: { w: 99, h: 210, label: "DIN lang (99 × 210 mm)" },
  Leporello: { w: 148, h: 105, label: "Leporello (148 × 105 mm)" },
};

// Render scale: 3× for ~300dpi equivalent at screen resolution
const SCALE = 3;
const BASE_PX_PER_MM = 3.7795; // 96dpi

export default function CardPdfExport({ caseData, generatedText, motifImageUrl, heroImageUrl, cardFormat, funeralHome, religion }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const frontRef = useRef(null);
  const insideRef = useRef(null);

  const dim = FORMAT_DIMS[cardFormat] || FORMAT_DIMS.DIN_A5_folded;

  const exportPdf = async () => {
    setExporting(true);
    try {
      const pxW = dim.w * BASE_PX_PER_MM * SCALE;
      const pxH = dim.h * BASE_PX_PER_MM * SCALE;

      // Capture both sides
      const [frontCanvas, insideCanvas] = await Promise.all([
        html2canvas(frontRef.current, { scale: SCALE, useCORS: true, allowTaint: true, width: frontRef.current.offsetWidth, height: frontRef.current.offsetHeight }),
        html2canvas(insideRef.current, { scale: SCALE, useCORS: true, allowTaint: true, width: insideRef.current.offsetWidth, height: insideRef.current.offsetHeight }),
      ]);

      // Create PDF — landscape or portrait based on format
      const landscape = dim.w > dim.h;
      const pdf = new jsPDF({
        orientation: landscape ? "landscape" : "portrait",
        unit: "mm",
        format: [dim.w, dim.h],
      });

      // Bleed: 3mm on each side
      const bleed = 3;
      const pageW = dim.w + bleed * 2;
      const pageH = dim.h + bleed * 2;

      // Page 1: Außenseite
      pdf.addPage([pageW, pageH], landscape ? "landscape" : "portrait");
      pdf.deletePage(1); // remove default empty page
      pdf.setPage(1);
      const frontImg = frontCanvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(frontImg, "JPEG", 0, 0, pageW, pageH);

      // Draw crop marks
      drawCropMarks(pdf, bleed, pageW, pageH);

      // Page 2: Innenseite
      pdf.addPage([pageW, pageH], landscape ? "landscape" : "portrait");
      const insideImg = insideCanvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(insideImg, "JPEG", 0, 0, pageW, pageH);
      drawCropMarks(pdf, bleed, pageW, pageH);

      const name = caseData ? `${caseData.deceased_first_name}_${caseData.deceased_last_name}` : "Trauerkarte";
      pdf.save(`Evertrace_${name}_Druckdaten.pdf`);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  };

  function drawCropMarks(pdf, bleed, pageW, pageH) {
    const len = 5;
    const gap = 2;
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.25);
    // Top-left
    pdf.line(0, bleed, bleed - gap, bleed);
    pdf.line(bleed, 0, bleed, bleed - gap);
    // Top-right
    pdf.line(pageW - bleed + gap, bleed, pageW, bleed);
    pdf.line(pageW - bleed, 0, pageW - bleed, bleed - gap);
    // Bottom-left
    pdf.line(0, pageH - bleed, bleed - gap, pageH - bleed);
    pdf.line(bleed, pageH, bleed, pageH - bleed + gap);
    // Bottom-right
    pdf.line(pageW - bleed + gap, pageH - bleed, pageW, pageH - bleed);
    pdf.line(pageW - bleed, pageH, pageW - bleed, pageH - bleed + gap);
  }

  // Hidden render targets (off-screen, exact format size)
  const renderW = Math.round(dim.w * BASE_PX_PER_MM);
  const renderH = Math.round(dim.h * BASE_PX_PER_MM);

  return (
    <div>
      {/* Hidden render containers */}
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
        <div ref={frontRef} style={{ width: renderW, height: renderH, overflow: "hidden" }}>
          <CardPrintPreview
            caseData={caseData}
            generatedText={generatedText}
            motifImageUrl={motifImageUrl}
            heroImageUrl={heroImageUrl}
            cardFormat={cardFormat}
            side="front"
            funeralHome={funeralHome}
            religion={religion}
          />
        </div>
        <div ref={insideRef} style={{ width: renderW, height: renderH, overflow: "hidden" }}>
          <CardPrintPreview
            caseData={caseData}
            generatedText={generatedText}
            motifImageUrl={motifImageUrl}
            heroImageUrl={heroImageUrl}
            cardFormat={cardFormat}
            side="inside"
            funeralHome={funeralHome}
            religion={religion}
          />
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={exportPdf}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        style={{
          background: exported ? "rgba(74,222,128,0.12)" : "rgba(201,169,110,0.1)",
          border: `1.5px solid ${exported ? "#4ade80" : "#c9a96e"}`,
          color: exported ? "#4ade80" : "#c9a96e",
        }}
      >
        {exporting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> PDF wird erstellt…</>
        ) : exported ? (
          <><Download className="w-4 h-4" /> ✓ PDF heruntergeladen</>
        ) : (
          <><Printer className="w-4 h-4" /> Druckdaten als PDF exportieren</>
        )}
      </button>

      <p className="text-xs mt-2 text-center" style={{ color: "#5a554e" }}>
        {dim.label} · 2 Seiten (Außen + Innen) · mit 3 mm Beschnitt & Schnittmarken
      </p>
    </div>
  );
}