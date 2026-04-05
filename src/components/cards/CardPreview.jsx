import { QrCode } from "lucide-react";

const FONT_SIZES = {
  small: { name: 18, date: 11, quote: 11, body: 13 },
  normal: { name: 24, date: 13, quote: 12, body: 14 },
  large: { name: 30, date: 14, quote: 14, body: 15 },
};
const PORTRAIT_SIZES = { small: 56, medium: 72, large: 96 };

export default function CardPreview({ bgImage, texts, showQr, side, memorial, designSettings = {} }) {
  const ds = {
    textAlign: "center", textPosition: "bottom", showPortrait: true,
    portraitPosition: "top", portraitSize: "medium", fontSize: "normal",
    motifOpacity: 80, overlayIntensity: 60, fontFamily: "Cormorant Garamond",
    nameColor: "#f0ede8", dateColor: "#c9a96e", quoteColor: "#f5e6b8",
    ...designSettings,
  };

  const fs = FONT_SIZES[ds.fontSize] || FONT_SIZES.normal;
  const portraitPx = PORTRAIT_SIZES[ds.portraitSize] || 72;
  const hasPortrait = ds.showPortrait && memorial?.hero_image_url;
  const verticalJustify = ds.textPosition === "top" ? "flex-start"
    : ds.textPosition === "center" ? "center" : "flex-end";
  const hAlign = ds.textAlign === "left" ? "flex-start" : ds.textAlign === "right" ? "flex-end" : "center";
  const overlayAlpha = ds.overlayIntensity / 100;

  const PortraitImg = () => (
    <div style={{
      width: portraitPx, height: portraitPx, borderRadius: "50%", overflow: "hidden",
      border: "3px solid rgba(201,169,110,0.5)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", flexShrink: 0,
    }}>
      <img src={memorial.hero_image_url} alt={texts.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${memorial.hero_image_position ?? 30}%` }} />
    </div>
  );

  if (side === "front") {
    return (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#2a2015" }}>
        {bgImage && (
          <img src={bgImage} alt="Hintergrund" className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: ds.motifOpacity / 100 }} />
        )}
        {/* Overlay for text readability */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(20,14,4,${overlayAlpha * 0.3}) 0%, rgba(20,14,4,${overlayAlpha * 0.85}) 100%)` }} />

        <div className="absolute inset-0 flex flex-col p-6" style={{ justifyContent: verticalJustify, textAlign: ds.textAlign }}>
          {/* Portrait — top */}
          {hasPortrait && (
            <div className="mb-4" style={{ display: "flex", justifyContent: hAlign }}>
              <PortraitImg />
            </div>
          )}

          {/* Text block */}
          <div>
            {texts.name && (
              <p className="font-semibold mb-1 leading-tight"
                style={{ fontFamily: `'${ds.fontFamily}', serif`, fontSize: fs.name, color: ds.nameColor, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
                {texts.name}
              </p>
            )}
            {(texts.birth || texts.death) && (
              <p className="mb-3" style={{ fontSize: fs.date, color: ds.dateColor, letterSpacing: "0.15em", opacity: 0.9 }}>
                {texts.birth && `* ${texts.birth}`}{texts.birth && texts.death && " — "}{texts.death && `† ${texts.death}`}
              </p>
            )}
            {texts.quote && (
              <p className="italic leading-relaxed"
                style={{ fontFamily: `'${ds.fontFamily}', serif`, fontSize: fs.quote, color: ds.quoteColor, maxWidth: 240,
                  marginLeft: ds.textAlign === "right" ? "auto" : ds.textAlign === "center" ? "auto" : 0,
                  marginRight: ds.textAlign === "left" ? "auto" : ds.textAlign === "center" ? "auto" : 0 }}>
                {texts.quote}
              </p>
            )}
            <div className="h-px mt-4" style={{
              width: 64, background: "rgba(201,169,110,0.6)",
              marginLeft: ds.textAlign === "left" ? 0 : "auto",
              marginRight: ds.textAlign === "right" ? 0 : "auto",
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Back / inside side
  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#f8f5ef" }}>
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
      )}
      <div className="relative h-full flex flex-col items-center justify-center p-8" style={{ textAlign: ds.textAlign }}>
        <div className="w-12 h-px mb-6" style={{ background: "#c9a96e" }} />
        {texts.body && (
          <p className="leading-relaxed mb-6"
            style={{ fontFamily: `'${ds.fontFamily}', serif`, fontSize: fs.body, color: "#4a3f35", maxWidth: 280, textAlign: ds.textAlign }}>
            {texts.body}
          </p>
        )}
        <div className="w-12 h-px mb-6" style={{ background: "#c9a96e" }} />
        {showQr && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: "#c9a96e", background: "white" }}>
              <QrCode className="w-8 h-8" style={{ color: "#c9a96e" }} />
            </div>
            <p className="text-xs text-gray-400">Digitale Gedenkseite</p>
          </div>
        )}
        <p className="absolute bottom-4 text-xs text-stone-300" style={{ letterSpacing: "0.15em" }}>EVERTRACE</p>
      </div>
    </div>
  );
}