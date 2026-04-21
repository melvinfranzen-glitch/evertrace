import { Baby, Heart, Star, GraduationCap, Briefcase, MapPin, Music, Camera } from "lucide-react";

const EVENT_TYPES = {
  geburt:       { label: "Geburt",        icon: Baby,          color: "#f0abfc" },
  hochzeit:     { label: "Hochzeit",       icon: Heart,         color: "#fca5a5" },
  meilenstein:  { label: "Meilenstein",   icon: Star,          color: "#fcd34d" },
  bildung:      { label: "Bildung",        icon: GraduationCap, color: "#6ee7b7" },
  beruf:        { label: "Beruf",          icon: Briefcase,     color: "#93c5fd" },
  reise:        { label: "Reise / Umzug",  icon: MapPin,        color: "#fdba74" },
  leidenschaft: { label: "Leidenschaft",   icon: Music,         color: "#c4b5fd" },
  erinnerung:   { label: "Erinnerung",     icon: Camera,        color: "#a3e635" },
};

function getType(val) {
  return EVENT_TYPES[val] || EVENT_TYPES.meilenstein;
}

export default function TimelineSection({ events }) {
  if (!events?.length) return null;

  const sorted = [...events].sort((a, b) => (a.year > b.year ? 1 : -1));

  return (
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Lebensweg</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Stationen des Lebens
          </h2>
        </div>

        <div className="relative">
          {/* Center line desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300 -translate-x-1/2 hidden md:block" />
          {/* Left line mobile */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-300 md:hidden" />

          <div className="space-y-10">
            {sorted.map((event, i) => {
              const isLeft = i % 2 === 0;
              const type = getType(event.event_type);
              const Icon = type.icon;
              return (
                <div key={event.id} className={`relative flex flex-col md:flex-row items-start gap-6 pl-12 md:pl-0 ${isLeft ? "" : "md:flex-row-reverse"}`}>
                  {/* Year bubble */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full items-center justify-center z-10 flex-col gap-0.5 shadow-md"
                    style={{ background: "linear-gradient(135deg,#c9a96e,#a07840)" }}>
                    <Icon className="w-4 h-4 text-white opacity-80" />
                    <span className="text-white text-[10px] font-bold text-center leading-tight px-1">{event.year}</span>
                  </div>

                  {/* Card */}
                  <div className={`md:w-5/12 bg-white rounded-2xl p-6 shadow-sm border border-stone-100 ${isLeft ? "md:mr-auto" : "md:ml-auto"}`}>
                    {/* Mobile: type badge + year */}
                    <div className="md:hidden flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                        <Icon className="w-3 h-3" /> {event.year}
                      </span>
                      <span className="text-xs text-gray-400">{type.label}</span>
                    </div>

                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-36 object-cover rounded-xl mb-4"
                        style={{ objectPosition: `center ${event.image_position ?? 30}%` }}
                      />
                    )}

                    {/* Desktop: category chip */}
                    <div className="hidden md:flex items-center gap-1.5 mb-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: type.color + "55", color: "#374151" }}
                      >
                        <Icon className="w-3 h-3" /> {type.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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