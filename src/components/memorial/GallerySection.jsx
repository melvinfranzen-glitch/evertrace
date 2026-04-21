import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GallerySection({ images, name }) {
  const [lightbox, setLightbox] = useState(null);

  const prev = () => setLightbox((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setLightbox((i) => (i < images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <section className="py-20 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>In Bildern</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Momente, die bleiben
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-xs mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Jedes Bild trägt ein Stück dieses einzigartigen Lebens in sich.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, i) => {
            const isVideo = /\.(mp4|webm|mov)$/i.test(url);
            return (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                onClick={() => setLightbox(i)}
              >
                {isVideo ? (
                  <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img
                    src={url}
                    alt={`${name} – Erinnerung ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>
          {/\.(mp4|webm|mov)$/i.test(images[lightbox]) ? (
            <video src={images[lightbox]} className="max-h-[88vh] max-w-[88vw] rounded-xl shadow-2xl" controls autoPlay onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={images[lightbox]} alt="" className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight className="w-9 h-9" />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-widest">
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}
    </section>
  );
}