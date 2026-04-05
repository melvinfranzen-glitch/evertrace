import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FamilyMemberModal from "./FamilyMemberModal";
import { ExternalLink } from "lucide-react";

const RELATION_LABEL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater (väterl.)", grossmutter_vaterseite: "Großmutter (väterl.)",
  grossvater_mutterseite: "Großvater (mütterl.)", grossmutter_mutterseite: "Großmutter (mütterl.)",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Ehepartner/in",
  sohn: "Sohn", tochter: "Tochter",
};

// ─── Person Node (Desktop) ────────────────────────────────

function PersonNode({ person, isDeceased, onClick, linkedId }) {
  const navigate = useNavigate();
  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasLinked = !!person.linked_memorial_short_id;

  const handleClick = () => {
    if (linkedId) navigate(`/MemorialProfile?id=${linkedId}`);
    else onClick();
  };

  return (
    <button onClick={handleClick} className="flex flex-col items-center gap-1.5 group focus:outline-none" style={{ minWidth: 70 }}>
      <div className="relative">
        <div className={`rounded-full flex items-center justify-center font-semibold overflow-hidden transition-all group-hover:scale-105 ${
          isDeceased
            ? "w-14 h-14 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2 text-sm"
            : "w-10 h-10 text-stone-600 bg-stone-200 text-xs"
        }`}
          style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#c9a96e)" } : {}}>
          {person.photo_url
            ? <img src={person.photo_url} className="w-full h-full object-cover object-face" alt={person.name} />
            : initials}
        </div>
        {hasLinked && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#c9a96e" }}>
            <ExternalLink className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <div className="text-center" style={{ maxWidth: 80 }}>
        <p className={`text-xs leading-tight truncate ${isDeceased ? "font-semibold text-amber-800" : "text-gray-700"}`}>
          {person.name}
        </p>
        {!isDeceased && (
          <p className="text-xs text-stone-400 leading-tight truncate">{RELATION_LABEL[person.relation] || person.relation}</p>
        )}
      </div>
    </button>
  );
}

// ─── Person Card (Mobile) ─────────────────────────────────

function PersonCard({ person, isDeceased, onClick, linkedId }) {
  const navigate = useNavigate();
  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasLinked = !!person.linked_memorial_short_id;

  const handleClick = () => {
    if (linkedId) navigate(`/MemorialProfile?id=${linkedId}`);
    else onClick();
  };

  return (
    <button onClick={handleClick} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]"
      style={{ background: isDeceased ? "rgba(201,169,110,0.08)" : "white", border: `1px solid ${isDeceased ? "rgba(201,169,110,0.3)" : "#e7e5e4"}` }}>
      <div className="relative flex-shrink-0">
        <div className={`rounded-full flex items-center justify-center font-semibold overflow-hidden ${
          isDeceased
            ? "w-12 h-12 text-white text-sm ring-2 ring-amber-500 ring-offset-1"
            : "w-10 h-10 text-stone-600 bg-stone-200 text-xs"
        }`}
          style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#c9a96e)" } : {}}>
          {person.photo_url
            ? <img src={person.photo_url} className="w-full h-full object-cover object-face" alt={person.name} />
            : initials}
        </div>
        {hasLinked && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#c9a96e" }}>
            <ExternalLink className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm leading-tight truncate ${isDeceased ? "font-semibold text-amber-800" : "font-medium text-gray-800"}`}>
          {person.name}
        </p>
        <p className="text-xs text-stone-400 truncate">
          {isDeceased ? "In liebevoller Erinnerung" : (RELATION_LABEL[person.relation] || person.relation)}
          {(person.birth_year || person.death_year) && (
            <span className="ml-1">· {person.birth_year || "?"}{person.death_year ? `–${person.death_year}` : ""}</span>
          )}
        </p>
      </div>
      {hasLinked && <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: "#c9a96e" }} />}
    </button>
  );
}

// ─── Verbindungslinien (Desktop only) ─────────────────────

function VLine() {
  return <div className="hidden md:flex justify-center my-1"><div className="w-px h-6 bg-stone-300" /></div>;
}

function HLine() {
  return <div className="hidden md:block w-6 h-px bg-stone-300 self-center flex-shrink-0" />;
}

// ─── Generations-Gruppe (Mobile) ──────────────────────────

function MobileGeneration({ label, members, onSelect }) {
  if (!members.length) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-2 ml-1" style={{ color: "#c9a96e", letterSpacing: "0.15em" }}>{label}</p>
      <div className="space-y-2">
        {members.map(m => (
          <PersonCard key={m.id || m.name} person={m} isDeceased={!!m._isDeceased}
            linkedId={m.linked_memorial_short_id}
            onClick={() => onSelect({ person: m, isDeceased: !!m._isDeceased })} />
        ))}
      </div>
    </div>
  );
}

// ─── Desktop-Reihe ────────────────────────────────────────

function DesktopGenRow({ label, children }) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-xs uppercase tracking-widest text-stone-400 mb-3" style={{ letterSpacing: "0.15em" }}>{label}</p>}
      <div className="flex items-end justify-center gap-4 flex-wrap">{children}</div>
    </div>
  );
}

// ─── HAUPTKOMPONENTE ──────────────────────────────────────

export default function FamilyTreeSection({ memorial }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.FamilyMember.filter({ memorial_id: memorial.id })
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [memorial.id]);

  if (loading || members.length === 0) return null;

  const by = (...rels) => members.filter(m => rels.includes(m.relation));

  const grandparents = by("grossvater_vaterseite", "grossmutter_vaterseite", "grossvater_mutterseite", "grossmutter_mutterseite");
  const parents = by("vater", "mutter");
  const siblings = by("bruder", "schwester");
  const spouses = by("ehepartner");
  const children = by("sohn", "tochter");

  const deceased = {
    name: memorial.name,
    photo_url: memorial.hero_image_url,
    hero_image_position: memorial.hero_image_position,
    birth_year: memorial.birth_date?.slice(0, 4),
    death_year: memorial.death_date?.slice(0, 4),
    _isDeceased: true,
  };

  const hasSibsOrSpouse = siblings.length > 0 || spouses.length > 0;

  return (
    <section className="py-20 px-6" style={{ background: "#FAF8F4" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Familie</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Stammbaum
          </h2>
        </div>

        {/* ═══ DESKTOP BAUM (md+) ═══ */}
        <div className="hidden md:block">
          <div className="space-y-0">
            {grandparents.length > 0 && (
              <>
                <DesktopGenRow label="Großeltern">
                  {grandparents.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </DesktopGenRow>
                <VLine />
              </>
            )}

            {parents.length > 0 && (
              <>
                <DesktopGenRow label="Eltern">
                  {parents.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </DesktopGenRow>
                <VLine />
              </>
            )}

            {hasSibsOrSpouse ? (
              <DesktopGenRow>
                {siblings.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                {siblings.length > 0 && <HLine />}
                <PersonNode person={deceased} isDeceased onClick={() => setSelected({ person: deceased, isDeceased: true })} />
                {spouses.length > 0 && <HLine />}
                {spouses.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
              </DesktopGenRow>
            ) : (
              <DesktopGenRow>
                <PersonNode person={deceased} isDeceased onClick={() => setSelected({ person: deceased, isDeceased: true })} />
              </DesktopGenRow>
            )}

            {children.length > 0 && (
              <>
                <VLine />
                <DesktopGenRow label="Kinder">
                  {children.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => setSelected({ person: m, isDeceased: false })} />)}
                </DesktopGenRow>
              </>
            )}
          </div>
        </div>

        {/* ═══ MOBILE LISTE (<md) ═══ */}
        <div className="md:hidden space-y-5">
          <PersonCard person={deceased} isDeceased
            onClick={() => setSelected({ person: deceased, isDeceased: true })} />
          <MobileGeneration label="Partner" members={spouses} onSelect={setSelected} />
          <MobileGeneration label="Eltern" members={parents} onSelect={setSelected} />
          <MobileGeneration label="Geschwister" members={siblings} onSelect={setSelected} />
          <MobileGeneration label="Kinder" members={children} onSelect={setSelected} />
          <MobileGeneration label="Großeltern" members={grandparents} onSelect={setSelected} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <p className="text-xs text-stone-400 italic">Auf ein Familienmitglied tippen, um mehr zu erfahren</p>
          {members.some(m => m.linked_memorial_short_id) && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#c9a96e" }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#c9a96e" }}>
                <ExternalLink className="w-2 h-2 text-white" />
              </div>
              <span>= eigene Gedenkseite</span>
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