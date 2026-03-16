import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FamilyMemberModal from "./FamilyMemberModal";
import { ExternalLink } from "lucide-react";

const RELATION_LABEL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater (v.)", grossmutter_vaterseite: "Großmutter (v.)",
  grossvater_mutterseite: "Großvater (m.)", grossmutter_mutterseite: "Großmutter (m.)",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Ehepartner/in",
  sohn: "Sohn", tochter: "Tochter",
};

function PersonNode({ person, isDeceased, onClick, linkedId }) {
  const initials = person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const hasLinked = !!person.linked_memorial_short_id;
  const handleClick = () => {
    if (linkedId) {
      window.location.href = `/MemorialProfile?id=${linkedId}`;
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-2 group focus:outline-none relative"
      title={linkedId ? `Zur Gedenkseite von ${person.name}` : `${person.name} – Profil anzeigen`}
    >
      <div className="relative">
        <div
          className={`rounded-full flex items-center justify-center font-semibold overflow-hidden transition-all group-hover:scale-110 group-hover:shadow-lg ${
            isDeceased
              ? "w-16 h-16 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2 text-base"
              : "w-11 h-11 text-stone-600 bg-stone-200 text-sm group-hover:ring-2 group-hover:ring-amber-400 group-hover:ring-offset-1"
          }`}
          style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#c9a96e)" } : {}}
        >
          {person.photo_url
            ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} />
            : initials}
        </div>
        {hasLinked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: "#c9a96e" }} title="Hat eigene Gedenkseite">
            <ExternalLink className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="text-center max-w-[88px]">
        <p className={`text-xs font-semibold leading-tight truncate group-hover:underline ${isDeceased ? "text-amber-800" : hasLinked ? "font-semibold" : "text-gray-700"}`}>
          {person.name}
        </p>
        {!isDeceased && (
          <p className="text-xs text-stone-400 leading-tight">{RELATION_LABEL[person.relation] || person.relation}</p>
        )}
        {(person.birth_year || person.death_year) && (
          <p className="text-xs text-stone-400">
            {person.birth_year || "?"}{person.death_year ? `–${person.death_year}` : ""}
          </p>
        )}
      </div>
    </button>
  );
}

function GenRow({ label, children }) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">{label}</p>}
      <div className="flex items-end justify-center gap-5 flex-wrap">{children}</div>
    </div>
  );
}

function VLine() {
  return <div className="flex justify-center my-1"><div className="w-px h-7 bg-stone-300" /></div>;
}

function HLine() {
  return <div className="w-8 h-px bg-stone-300 self-center flex-shrink-0" />;
}

export default function FamilyTreeSection({ memorial }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { person, isDeceased }

  useEffect(() => {
    base44.entities.FamilyMember.filter({ memorial_id: memorial.id })
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [memorial.id]);

  if (loading || members.length === 0) return null;

  const by = (...rels) => members.filter((m) => rels.includes(m.relation));

  const grandparents = by("grossvater_vaterseite", "grossmutter_vaterseite", "grossvater_mutterseite", "grossmutter_mutterseite");
  const parents = by("vater", "mutter");
  const siblings = by("bruder", "schwester");
  const spouses = by("ehepartner");
  const children = by("sohn", "tochter");

  const deceased = {
    name: memorial.name,
    birth_year: memorial.birth_date?.slice(0, 4),
    death_year: memorial.death_date?.slice(0, 4),
  };

  const hasSibsOrSpouse = siblings.length > 0 || spouses.length > 0;

  return (
    <section className="py-20 px-6" style={{ background: "#FAF8F4" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Familie</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Stammbaum
          </h2>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="min-w-[320px] space-y-0">

            {grandparents.length > 0 && (
              <>
                <GenRow label="Großeltern">
                  {grandparents.map((m) => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </GenRow>
                <VLine />
              </>
            )}

            {parents.length > 0 && (
              <>
                <GenRow label="Eltern">
                  {parents.map((m) => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </GenRow>
                <VLine />
              </>
            )}

            {/* Center row: siblings – deceased – spouse */}
            {hasSibsOrSpouse ? (
              <GenRow>
                {siblings.map((m) => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                {siblings.length > 0 && <HLine />}
                <PersonNode person={deceased} isDeceased onClick={() => setSelected({ person: deceased, isDeceased: true })} />
                {spouses.length > 0 && <HLine />}
                {spouses.map((m) => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
              </GenRow>
            ) : (
              <GenRow>
                <PersonNode person={deceased} isDeceased onClick={() => setSelected({ person: deceased, isDeceased: true })} />
              </GenRow>
            )}

            {children.length > 0 && (
              <>
                <VLine />
                <GenRow label="Kinder">
                  {children.map((m) => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </GenRow>
              </>
            )}

            </div>
          </div>
        </div>

        <div className="md:hidden text-center text-xs mt-2" style={{ color: "#8a8278" }}>← Zum Scrollen wischen →</div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <p className="text-xs text-stone-400 italic">
            Auf ein Familienmitglied klicken, um das Kurzprofil anzuzeigen
          </p>
          {members.some(m => m.linked_memorial_short_id) && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#c9a96e" }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#c9a96e" }}>
                <ExternalLink className="w-2 h-2 text-white" />
              </div>
              <span>= eigene Gedenkseite vorhanden</span>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <FamilyMemberModal
          person={selected.person}
          isDeceased={selected.isDeceased}
          memorialId={memorial.id}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}