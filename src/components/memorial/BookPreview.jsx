import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmt(d) {
  try { return format(new Date(d), "d. MMMM yyyy", { locale: de }); }
  catch { return d || ""; }
}

// A single simulated book page wrapper
function BookPage({ children, className = "" }) {
  return (
    <div
      className={`relative bg-white shadow-lg rounded-sm overflow-hidden ${className}`}
      style={{ aspectRatio: "3/4", border: "1px solid #e7e5e4" }}
    >
      {/* Decorative top-border */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #c9a84c, #e6cc80, #c9a84c)" }} />
      {children}
    </div>
  );
}

// Cover
function CoverPage({ memorial }) {
  return (
    <BookPage>
      <div className="flex flex-col h-full">
        {memorial.hero_image_url ? (
          <div className="flex-1 overflow-hidden">
            <img src={memorial.hero_image_url} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.88) sepia(0.12)" }} />
          </div>
        ) : (
          <div className="flex-1" style={{ background: "linear-gradient(160deg, #2d1f0a, #1a1410)" }} />
        )}
        <div className="p-5 text-center" style={{ background: "#fafaf8" }}>
          <div className="h-px mb-3 mx-6" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
          <h2 className="font-semibold text-gray-800 text-lg leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {memorial.name}
          </h2>
          {(memorial.birth_date || memorial.death_date) && (
            <p className="text-xs text-gray-400">
              {memorial.birth_date ? fmt(memorial.birth_date) : "?"} — {memorial.death_date ? fmt(memorial.death_date) : "?"}
            </p>
          )}
          {memorial.subtitle && (
            <p className="text-xs italic mt-1.5" style={{ color: "#a07830" }}>„{memorial.subtitle}"</p>
          )}
          <div className="h-px mt-3 mx-6" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
          <p className="text-xs mt-2" style={{ color: "#c9a84c", letterSpacing: "0.15em", fontSize: "0.55rem" }}>EVERTRACE · ERINNERUNGSBUCH</p>
        </div>
      </div>
    </BookPage>
  );
}

// Biography page
function BioPage({ memorial }) {
  return (
    <BookPage>
      <div className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#c9a84c", fontSize: "0.55rem" }}>Lebensgeschichte</p>
        <h3 className="text-base font-semibold text-gray-800 mb-3 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
          {memorial.name}
        </h3>
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, #c9a84c, transparent)" }} />
        <p className="text-gray-600 leading-relaxed flex-1 overflow-hidden" style={{ fontSize: "0.62rem", lineHeight: "1.7" }}>
          {memorial.biography
            ? memorial.biography.slice(0, 600) + (memorial.biography.length > 600 ? " …" : "")
            : "Die Lebensgeschichte wird hier abgedruckt."}
        </p>
        <p className="text-right mt-3" style={{ color: "#d1c4a8", fontSize: "0.5rem", letterSpacing: "0.1em" }}>— 1 —</p>
      </div>
    </BookPage>
  );
}

// Gallery spread
function GalleryPage({ images, title = "Erinnerungen in Bildern" }) {
  const shown = images.slice(0, 4);
  return (
    <BookPage>
      <div className="p-4 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-3 text-center" style={{ color: "#c9a84c", fontSize: "0.55rem" }}>{title}</p>
        <div className="grid grid-cols-2 gap-1.5 flex-1">
          {shown.map((url, i) => (
            <div key={i} className="rounded overflow-hidden bg-stone-100">
              <img src={url} alt="" className="w-full h-full object-cover" style={{ filter: "sepia(0.08)" }} />
            </div>
          ))}
          {shown.length === 0 && (
            <div className="col-span-2 flex items-center justify-center text-stone-300 text-xs">Keine Bilder vorhanden</div>
          )}
        </div>
      </div>
    </BookPage>
  );
}

// Condolence page (up to 3 entries per page)
function CondolencePage({ entries, pageNum }) {
  return (
    <BookPage>
      <div className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#c9a84c", fontSize: "0.55rem" }}>Worte des Gedenkens</p>
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, #c9a84c, transparent)" }} />
        <div className="space-y-4 flex-1">
          {entries.map((e) => (
            <div key={e.id} className="border-l-2 pl-3" style={{ borderColor: "#e6cc80" }}>
              <p className="text-gray-600 italic leading-relaxed mb-1" style={{ fontSize: "0.6rem", lineHeight: "1.65" }}>
                „{e.message.slice(0, 220)}{e.message.length > 220 ? " …" : ""}"
              </p>
              <p className="font-semibold text-gray-700" style={{ fontSize: "0.55rem" }}>— {e.author_name}</p>
            </div>
          ))}
        </div>
        <p className="text-right mt-3" style={{ color: "#d1c4a8", fontSize: "0.5rem", letterSpacing: "0.1em" }}>— {pageNum} —</p>
      </div>
    </BookPage>
  );
}

export default function BookPreview({ memorial, condolences, selectedImages }) {
  const approved = condolences.filter((c) => c.status === "approved");
  // chunk condolences into pages of 3
  const condoChunks = [];
  for (let i = 0; i < approved.length; i += 3) condoChunks.push(approved.slice(i, i + 3));

  return (
    <div>
      <p className="text-xs text-gray-400 text-center mb-4">Buchvorschau · alle Seiten in miniaturierter Darstellung</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <CoverPage memorial={memorial} />
        <BioPage memorial={memorial} />
        {selectedImages.length > 0 && <GalleryPage images={selectedImages} />}
        {condoChunks.map((chunk, i) => (
          <CondolencePage key={i} entries={chunk} pageNum={i + 3} />
        ))}
        {/* Back cover */}
        <BookPage>
          <div className="h-full flex flex-col items-center justify-center p-6 text-center"
            style={{ background: "linear-gradient(160deg, #1a1410, #2d1f0a)" }}>
            <div className="h-px w-12 mb-4" style={{ background: "#c9a84c" }} />
            <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{memorial.name}</p>
            {memorial.death_date && <p className="text-stone-500 text-xs">† {fmt(memorial.death_date)}</p>}
            <div className="h-px w-12 mt-4 mb-3" style={{ background: "#c9a84c" }} />
            <p style={{ color: "#c9a84c", fontSize: "0.55rem", letterSpacing: "0.2em" }}>EVERTRACE</p>
          </div>
        </BookPage>
      </div>
    </div>
  );
}