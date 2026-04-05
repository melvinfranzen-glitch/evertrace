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

// ─── Desktop PersonNode (horizontal tree) ─────────────────

function PersonNode({ person, isDeceased, onClick, linkedId }) {
  const navigate = useNavigate();
  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasLinked = !!person.linked_memorial_short_id;
  const handleClick = () => {
    if (linkedId) navigate(`/MemorialProfile?id=${linkedId}`);
    else onClick();
  };

  return (
    <button onClick={handleClick} className="flex flex-col items-center gap-1.5 group focus:outline-none" style={{ minWidth: 72 }}>
      <div className="relative">
        <div className={`rounded-full flex items-center justify-center font-semibold overflow-hidden transition-all group-hover:scale-105 ${
          isDeceased ? "w-16 h-16 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2 text-base"
            : "w-11 h-11 text-stone-600 bg-stone-200 text-sm"
        }`} style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#c9a96e)" } : {}}>
          {person.photo_url
            ? <img src={person.photo_url} className="w-full h-full object-cover object-face" alt={person.name} />
            : initials}
        </div>
        {hasLinked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#c9a96e" }}>
            <ExternalLink className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="text-center max-w-[88px]">
        <p className={`text-xs font-semibold leading-tight truncate group-hover:underline ${isDeceased ? "text-amber-800" : "text-gray-700"}`}>
          {person.name}
        </p>
        {!isDeceased && <p className="text-xs text-stone-400 leading-tight">{RELATION_LABEL[person.relation] || person.relation}</p>}
        {(person.birth_year || person.death_year) && (
          <p className="text-xs text-stone-400">{person.birth_year || "?"}{person.death_year ? `–${person.death_year}` : ""}</p>
        )}
      </div>
    </button>
  );
}

// ─── Mobile Tree Node (vertical tree) ─────────────────────

function MobileTreeNode({ person, isDeceased, onClick, linkedId, isLast = false }) {
  const navigate = useNavigate();
  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasLinked = !!person.linked_memorial_short_id;
  const handleClick = () => {
    if (linkedId) navigate(`/MemorialProfile?id=${linkedId}`);
    else onClick();
  };

  const avatarSize = isDeceased ? "w-14 h-14" : "w-10 h-10";
  const avatarText = isDeceased ? "text-sm" : "text-xs";

  return (
    <div className="relative flex items-start">
      {/* Vertikale Stammlinie + horizontaler Ast */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
        {/* Obere vertikale Linie */}
        <div className="w-px flex-1" style={{ background: "#d4c9b0", minHeight: 8 }} />
        {/* Horizontaler Ast-Punkt */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
          style={{ background: isDeceased ? "#c9a96e" : "#d4c9b0", border: isDeceased ? "2px solid #a07830" : "none" }} />
        {/* Untere vertikale Linie (nicht beim letzten Element) */}
        {!isLast && <div className="w-px flex-1" style={{ background: "#d4c9b0", minHeight: 8 }} />}
        {isLast && <div className="flex-1" />}
      </div>

      {/* Horizontaler Ast */}
      <div className="w-4 h-px self-center flex-shrink-0 -ml-px" style={{ background: "#d4c9b0", marginTop: isDeceased ? 0 : -2 }} />

      {/* Person Card */}
      <button onClick={handleClick} className="flex items-center gap-3 py-2 pr-3 flex-1 min-w-0 rounded-xl transition-all active:bg-stone-50"
        style={{ marginTop: isDeceased ? -4 : -6, marginBottom: isDeceased ? -4 : -6 }}>
        <div className="relative flex-shrink-0">
          <div className={`${avatarSize} rounded-full flex items-center justify-center font-semibold overflow-hidden ${avatarText} ${
            isDeceased ? "text-white ring-2 ring-amber-500 ring-offset-1 shadow-md" : "text-stone-600 bg-stone-200"
          }`} style={isDeceased ? { background: "linear-gradient(135deg,#92400e,#c9a96e)" } : {}}>
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
        <div className="min-w-0">
          <p className={`text-sm leading-tight truncate ${isDeceased ? "font-semibold text-amber-800" : "font-medium text-gray-800"}`}>
            {person.name}
          </p>
          <p className="text-xs text-stone-400 truncate">
            {isDeceased ? "In liebevoller Erinnerung" : (RELATION_LABEL[person.relation] || person.relation)}
            {(person.birth_year || person.death_year) && (
              <span> · {person.birth_year || "?"}{person.death_year ? `–${person.death_year}` : ""}</span>
            )}
          </p>
        </div>
        {hasLinked && <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-auto" style={{ color: "#c9a96e" }} />}
      </button>
    </div>
  );
}

// ─── Mobile Generation Label ──────────────────────────────

function MobileGenLabel({ label }) {
  return (
    <div className="relative flex items-start">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
        <div className="w-px flex-1" style={{ background: "#d4c9b0" }} />
      </div>
      <p className="text-xs uppercase tracking-widest py-2 pl-4" style={{ color: "#c9a96e", letterSpacing: "0.15em", fontWeight: 500 }}>
        {label}
      </p>
    </div>
  );
}

// ─── Desktop Helpers ──────────────────────────────────────

function GenRow({ label, children }) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">{label}</p>}
      <div className="flex items-end justify-center gap-5 flex-wrap">{children}</div>
    </div>
  );
}
function VLine() { return <div className="flex justify-center my-1"><div className="w-px h-7 bg-stone-300" /></div>; }
function HLine() { return <div className="w-8 h-px bg-stone-300 self-center flex-shrink-0" />; }

// ─── HAUPTKOMPONENTE ──────────────────────────────────────

export default function FamilyTreeSection({ memorial }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.FamilyMember.filter({ memorial_id: memorial.id })
      .then(setMembers).finally(() => setLoading(false));
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
    birth_year: memorial.birth_date?.slice(0, 4),
    death_year: memorial.death_date?.slice(0, 4),
  };

  const hasSibsOrSpouse = siblings.length > 0 || spouses.length > 0;

  const onSelect = (person, isDec = false) => setSelected({ person, isDeceased: isDec });

  // Baue die Mobile-Reihenfolge: Großeltern → Eltern → Geschwister → Verstorbene/r + Partner → Kinder
  const mobileGroups = [];
  if (grandparents.length) mobileGroups.push({ label: "Großeltern", members: grandparents });
  if (parents.length) mobileGroups.push({ label: "Eltern", members: parents });
  if (siblings.length) mobileGroups.push({ label: "Geschwister", members: siblings });
  mobileGroups.push({ label: null, members: [{ ...deceased, _isDeceased: true }] });
  if (spouses.length) mobileGroups.push({ label: "Partner", members: spouses });
  if (children.length) mobileGroups.push({ label: "Kinder", members: children });

  // Flatten für isLast Berechnung
  const allMobileNodes = mobileGroups.flatMap(g => g.members);
  let nodeIndex = 0;

  return (
    <section className="py-20 px-6" style={{ background: "#FAF8F4" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Familie</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Stammbaum
          </h2>
        </div>

        {/* ═══ DESKTOP (md+): Horizontaler Baum ═══ */}
        <div className="hidden md:block">
          <div className="space-y-0">
            {grandparents.length > 0 && (
              <><GenRow label="Großeltern">
                {grandparents.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => onSelect(m)} />)}
              </GenRow><VLine /></>
            )}
            {parents.length > 0 && (
              <><GenRow label="Eltern">
                {parents.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => onSelect(m)} />)}
              </GenRow><VLine /></>
            )}
            {hasSibsOrSpouse ? (
              <GenRow>
                {siblings.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => onSelect(m)} />)}
                {siblings.length > 0 && <HLine />}
                <PersonNode person={deceased} isDeceased onClick={() => onSelect(deceased, true)} />
                {spouses.length > 0 && <HLine />}
                {spouses.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => onSelect(m)} />)}
              </GenRow>
            ) : (
              <GenRow><PersonNode person={deceased} isDeceased onClick={() => onSelect(deceased, true)} /></GenRow>
            )}
            {children.length > 0 && (
              <><VLine /><GenRow label="Kinder">
                {children.map(m => <PersonNode key={m.id} person={m} linkedId={m.linked_memorial_short_id} onClick={() => onSelect(m)} />)}
              </GenRow></>
            )}
          </div>
        </div>

        {/* ═══ MOBILE (<md): Vertikaler Baum ═══ */}
        <div className="md:hidden pl-2">
          {mobileGroups.map((group, gi) => {
            const nodes = group.members;
            return (
              <div key={gi}>
                {group.label && <MobileGenLabel label={group.label} />}
                {nodes.map((m, mi) => {
                  const currentIdx = nodeIndex++;
                  const isLast = currentIdx === allMobileNodes.length - 1;
                  const isDec = !!m._isDeceased;
                  return (
                    <MobileTreeNode
                      key={m.id || m.name}
                      person={m}
                      isDeceased={isDec}
                      linkedId={m.linked_memorial_short_id}
                      isLast={isLast}
                      onClick={() => onSelect(m, isDec)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Info-Hinweis */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <p className="text-xs text-stone-400 italic">
            Familienmitglied antippen für Details
          </p>
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
        <FamilyMemberModal person={selected.person} isDeceased={selected.isDeceased}
          memorialId={memorial.id} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}