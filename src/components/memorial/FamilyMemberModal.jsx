import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Calendar, Heart, MessageSquare, ExternalLink } from "lucide-react";

const RELATION_LABEL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater (väterl. Seite)", grossmutter_vaterseite: "Großmutter (väterl. Seite)",
  grossvater_mutterseite: "Großvater (mütterl. Seite)", grossmutter_mutterseite: "Großmutter (mütterl. Seite)",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Ehepartner/in",
  sohn: "Sohn", tochter: "Tochter",
};

export default function FamilyMemberModal({ person, memorialId, isDeceased, onClose }) {
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(true);

  const initials = person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isDeceased && memorialId) {
      base44.entities.MemoryWallEntry.filter({ memorial_id: memorialId, status: "approved" })
        .then((entries) => {
          // Filter entries that mention the person's name
          const related = entries.filter((e) =>
            e.message?.toLowerCase().includes(person.name.split(" ")[0].toLowerCase())
          );
          setMemories(related);
        })
        .finally(() => setLoadingMemories(false));
    } else {
      setLoadingMemories(false);
    }
  }, [person, memorialId, isDeceased]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,2,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-24 rounded-t-2xl" style={{ background: "linear-gradient(135deg,#92400e,#c9a84c)" }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-12 px-6 pb-6">
          <div
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-2xl"
            style={isDeceased
              ? { background: "linear-gradient(135deg,#a07830,#c9a96e)", color: "white" }
              : { background: "#e7e2db", color: "#6b5a44" }
            }
          >
            {person.photo_url
              ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} />
              : initials
            }
          </div>

          <h3 className="mt-3 text-xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {person.name}
          </h3>

          {!isDeceased && person.relation && (
            <span className="mt-1 text-sm px-3 py-0.5 rounded-full font-medium" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}>
              {RELATION_LABEL[person.relation] || person.relation}
            </span>
          )}
          {isDeceased && (
            <span className="mt-1 text-sm font-light italic" style={{ color: '#c9a96e', fontFamily: "'Cormorant Garamond', serif" }}>
              In liebevoller Erinnerung
            </span>
          )}

          {/* Details */}
          <div className="mt-5 w-full space-y-2">
            {(person.birth_year || person.death_year) && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FAF8F4" }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#c9a96e" }} />
                <span className="text-sm text-gray-600">
                  {person.birth_year && <>geb. {person.birth_year}</>}
                  {person.birth_year && person.death_year && " · "}
                  {person.death_year && <>gest. {person.death_year}</>}
                </span>
              </div>
            )}

            {person.notes && (
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#FAF8F4" }}>
                <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c9a96e" }} />
                <p className="text-sm text-gray-600 leading-relaxed">{person.notes}</p>
              </div>
            )}
          </div>

          {/* Link to own memorial page */}
          {person.linked_memorial_short_id && (
            <a
              href={`/MemorialProfile?id=${person.linked_memorial_short_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}
            >
              <ExternalLink className="w-4 h-4" />
              Zur Gedenkseite von {person.name.split(" ")[0]}
            </a>
          )}

          {/* Related Memories */}
          {!isDeceased && !loadingMemories && memories.length > 0 && (
            <div className="mt-6 w-full">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" style={{ color: "#c9a96e" }} />
                <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "#c9a96e" }}>
                  Erwähnungen in Erinnerungen
                </p>
              </div>
              <div className="space-y-3">
                {memories.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-stone-100" style={{ background: "#FDFCFA" }}>
                    <p className="text-sm text-gray-600 leading-relaxed italic">„{m.message}"</p>
                    <p className="text-xs text-stone-400 mt-1.5">— {m.author_name}{m.relation ? `, ${m.relation}` : ""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}