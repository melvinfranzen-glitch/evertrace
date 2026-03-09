import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GallerySection({ images, name }) {
  const [lightbox, setLightbox] = useState(null);

  const prev = () => setLightbox((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setLightbox((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Erinnerungen</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bildergalerie
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
              onClick={() => setLightbox(i)}
            >
              <img src={url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <button onClick={prev} className="absolute left-4 text-white hover:text-gray-300">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img src={images[lightbox]} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
          <button onClick={next} className="absolute right-4 text-white hover:text-gray-300">
            <ChevronRight className="w-10 h-10" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}
    </section>
  );
}