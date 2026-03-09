export default function TimelineSection({ events }) {
  if (!events?.length) return null;

  return (
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Lebensweg</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Stationen des Lebens
          </h2>
        </div>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300 -translate-x-1/2 hidden md:block" />

          <div className="space-y-10">
            {events.map((event, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={event.id} className={`relative flex flex-col md:flex-row items-start gap-6 ${isLeft ? "" : "md:flex-row-reverse"}`}>
                  {/* Year bubble */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full items-center justify-center z-10 text-white text-xs font-bold text-center leading-tight"
                    style={{ background: "linear-gradient(135deg,#b45309,#92400e)" }}>
                    {event.year}
                  </div>

                  {/* Card */}
                  <div className={`md:w-5/12 bg-white rounded-2xl p-6 shadow-sm border border-stone-100 ${isLeft ? "md:mr-auto" : "md:ml-auto"}`}>
                    <div className="md:hidden inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3" style={{ background: "#b45309" }}>
                      {event.year}
                    </div>
                    {event.image_url && (
                      <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover rounded-xl mb-4" />
                    )}
                    <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block md:w-5/12" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}