import { QrCode } from "lucide-react";

export default function CardPreview({ bgImage, texts, showQr, side, memorial }) {
  const font = texts.font || "Playfair Display";

  if (side === "front") {
    return (
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#2a2015" }}>
        {bgImage && (
          <img src={bgImage} alt="Hintergrund" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        )}
        {/* Dark gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(20,14,4,0.2) 0%, rgba(20,14,4,0.75) 100%)" }} />

        {/* Portrait */}
        {memorial?.hero_image_url && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-2"
            style={{ borderColor: "rgba(201,168,76,0.5)" }}>
            <img src={memorial.hero_image_url} alt={texts.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-7 text-center text-white">
          {texts.name && (
            <p className="text-2xl font-semibold mb-1 leading-tight" style={{ fontFamily: font, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {texts.name}
            </p>
          )}
          {(texts.birth || texts.death) && (
            <p className="text-sm mb-3 opacity-80" style={{ letterSpacing: "0.15em" }}>
              {texts.birth && `* ${texts.birth}`}{texts.birth && texts.death && " — "}{texts.death && `† ${texts.death}`}
            </p>
          )}
          {texts.quote && (
            <p className="text-xs leading-relaxed italic opacity-90 max-w-xs mx-auto"
              style={{ fontFamily: font, color: "#f5e6b8" }}>
              {texts.quote}
            </p>
          )}
          {/* Gold line */}
          <div className="w-16 h-px mx-auto mt-4" style={{ background: "rgba(201,168,76,0.6)" }} />
        </div>
      </div>
    );
  }

  // Back side
  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: "#f8f5ef" }}>
      {bgImage && (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
      )}

      <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
        {/* Gold ornament */}
        <div className="w-12 h-px mb-6" style={{ background: "#c9a84c" }} />

        {texts.body ? (
          <p className="text-sm text-gray-700 leading-relaxed mb-6" style={{ fontFamily: font }}>
            {texts.body}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-6">Innentext hier…</p>
        )}

        <div className="w-12 h-px mb-6" style={{ background: "#c9a84c" }} />

        {/* QR placeholder */}
        {showQr && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-lg border-2 flex items-center justify-center"
              style={{ borderColor: "#c9a84c", background: "white" }}>
              <QrCode className="w-8 h-8" style={{ color: "#c9a84c" }} />
            </div>
            <p className="text-xs text-gray-400">Digitale Gedenkseite</p>
          </div>
        )}

        {/* Evertrace watermark */}
        <p className="absolute bottom-4 text-xs text-stone-300" style={{ letterSpacing: "0.15em" }}>
          EVERTRACE
        </p>
      </div>
    </div>
  );
}