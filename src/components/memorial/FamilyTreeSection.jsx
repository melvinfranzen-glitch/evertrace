import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FamilyMemberModal from "./FamilyMemberModal";

const RELATION_LABEL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater (v.)", grossmutter_vaterseite: "Großmutter (v.)",
  grossvater_mutterseite: "Großvater (m.)", grossmutter_mutterseite: "Großmutter (m.)",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Ehepartner/in",
  sohn: "Sohn", tochter: "Tochter",
};

function PersonNode({ person, isDeceased, onClick }) {
  const initials = person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group focus:outline-none"
      title={`${person.name} – Profil anzeigen`}
    >
      <div
        className={`rounded-full flex items-center justify-center font-semibold overflow-hidden transition-all group-hover:scale-110 group-hover:shadow-lg ${
          isDeceased
            ? "w-16 h-16 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2 text-base"
            : "w-11 h-11 text-stone-600 bg-stone-200 text-sm group-hover:ring-2 group-hover:ring-amber-400 group-hover:ring-offset-1"
        }`}
        style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#b45309)" } : {}}
      >
        {person.photo_url
          ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} />
          : initials}
      </div>
      <div className="text-center max-w-[88px]">
        <p className={`text-xs font-semibold leading-tight truncate group-hover:underline ${isDeceased ? "text-amber-800" : "text-gray-700"}`}>
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
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Familie</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Stammbaum
          </h2>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[280px] space-y-0">

            {grandparents.length > 0 && (
              <>
                <GenRow label="Großeltern">
                  {grandparents.map((m) => <PersonNode key={m.id} person={m} />)}
                </GenRow>
                <VLine />
              </>
            )}

            {parents.length > 0 && (
              <>
                <GenRow label="Eltern">
                  {parents.map((m) => <PersonNode key={m.id} person={m} />)}
                </GenRow>
                <VLine />
              </>
            )}

            {/* Center row: siblings – deceased – spouse */}
            {hasSibsOrSpouse ? (
              <GenRow label={parents.length === 0 && grandparents.length === 0 ? undefined : undefined}>
                {siblings.map((m) => <PersonNode key={m.id} person={m} />)}
                {siblings.length > 0 && <HLine />}
                <PersonNode person={deceased} isDeceased />
                {spouses.length > 0 && <HLine />}
                {spouses.map((m) => <PersonNode key={m.id} person={m} />)}
              </GenRow>
            ) : (
              <GenRow>
                <PersonNode person={deceased} isDeceased />
              </GenRow>
            )}

            {children.length > 0 && (
              <>
                <VLine />
                <GenRow label="Kinder">
                  {children.map((m) => <PersonNode key={m.id} person={m} />)}
                </GenRow>
              </>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}