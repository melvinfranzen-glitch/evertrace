const testimonials = [
  {
    name: "Maria K.",
    relation: "Tochter",
    text: "Evertrace hat uns geholfen, die Geschichte meines Vaters würdevoll zu bewahren. Die KI-Biografie klingt, als hätte er sie selbst geschrieben – wir sind überwältigt.",
    stars: 5,
    initial: "M",
  },
  {
    name: "Thomas B.",
    relation: "Ehemann",
    text: "Die Messing-Plakette am Grabstein zieht täglich Besucher in ihren Bann. Jeder scannt den Code und liest die Geschichte meiner Frau. Ein Geschenk für die Familie.",
    stars: 5,
    initial: "T",
  },
  {
    name: "Sabine W.",
    relation: "Enkelin",
    text: "Innerhalb einer Stunde hatten wir eine vollständige Gedenkseite mit Fotos, Biografie und virtuellem Kondolenzbuch. Einfach, würdevoll und wunderschön.",
    stars: 5,
    initial: "S",
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-4 h-4" fill="#c9a84c" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(160deg, #1a1410, #231a0e)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.35em] font-medium mb-4" style={{ color: "#c9a84c" }}>
            Stimmen der Familien
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Was Trauernde sagen
          </h2>
          <p className="text-stone-400 font-light max-w-md mx-auto leading-relaxed">
            Über 500 Familien vertrauen Evertrace, um die Erinnerung zu bewahren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Stars count={t.stars} />
              <p className="text-stone-300 text-sm leading-relaxed flex-1 mb-6 italic">
                „{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", fontFamily: "'Playfair Display', serif" }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-stone-500 text-xs">{t.relation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate rating */}
        <div className="mt-10 flex items-center justify-center gap-3 text-stone-400 text-sm">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4" fill="#c9a84c" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span><strong className="text-white">4.9 / 5</strong> · Basierend auf über 500 Gedenkseiten</span>
        </div>
      </div>
    </section>
  );
}