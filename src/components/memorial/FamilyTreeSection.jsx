import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Camera, Plus, X, Save, Loader2, Heart, Calendar, Edit3, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const REL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater", grossmutter_vaterseite: "Großmutter",
  grossvater_mutterseite: "Großvater", grossmutter_mutterseite: "Großmutter",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Partner/in",
  sohn: "Sohn", tochter: "Tochter",
};

function PersonBubble({ person, isDeceased, onClick, size = "md" }) {
  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasPhoto = !!person.photo_url;
  const hasLinked = !!person.linked_memorial_short_id;
  
  const sizes = {
    sm: { avatar: "w-12 h-12", text: "text-xs", nameW: "max-w-[72px]", fontSize: 10 },
    md: { avatar: "w-14 h-14", text: "text-sm", nameW: "max-w-[84px]", fontSize: 11 },
    lg: { avatar: "w-20 h-20", text: "text-base", nameW: "max-w-[100px]", fontSize: 12 },
  };
  const s = sizes[size];

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group focus:outline-none touch-target">
      <div className="relative">
        {isDeceased && (
          <div className="absolute -inset-1 rounded-full animate-pulse" 
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.25) 0%, transparent 70%)" }} />
        )}
        <div className={`${s.avatar} rounded-full flex items-center justify-center font-semibold overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95 ${s.text}`}
          style={{
            background: isDeceased ? "linear-gradient(135deg, #92400e, #c9a96e)" : hasPhoto ? "#e7e2db" : "#e7e2db",
            color: isDeceased ? "white" : "#6b5a44",
            boxShadow: isDeceased 
              ? "0 4px 20px rgba(201,169,110,0.4), 0 0 0 3px rgba(201,169,110,0.3)" 
              : "0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px rgba(0,0,0,0.04)",
          }}>
          {hasPhoto 
            ? <img src={person.photo_url} className="w-full h-full object-cover object-face" alt={person.name} />
            : initials}
        </div>
        {hasLinked && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            style={{ background: "#c9a96e", border: "2px solid white" }}>
            <ExternalLink className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {!hasPhoto && !isDeceased && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: "#e7e2db", border: "2px solid white" }}>
            <Camera className="w-2.5 h-2.5" style={{ color: "#8a8278" }} />
          </div>
        )}
      </div>
      <div className={`text-center ${s.nameW}`}>
        <p className="font-medium leading-tight truncate" 
          style={{ fontSize: s.fontSize, color: isDeceased ? "#92400e" : "#2c2419" }}>
          {person.name}
        </p>
        {!isDeceased && (
          <p className="leading-tight truncate" style={{ fontSize: Math.max(s.fontSize - 2, 9), color: "#a09080" }}>
            {REL[person.relation] || person.relation}
          </p>
        )}
      </div>
    </button>
  );
}

function ConnectorLine() {
  return (
    <div className="flex justify-center">
      <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, #d4c9b0, #e4ddd0)" }} />
    </div>
  );
}

function HorizontalConnector() {
  return <div className="w-6 h-px flex-shrink-0 self-center" style={{ background: "#d4c9b0" }} />;
}

function GenerationRow({ label, children }) {
  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-xs uppercase tracking-widest mb-3" 
          style={{ color: "#c9a96e", letterSpacing: "0.18em", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          {label}
        </p>
      )}
      <div className="flex items-center justify-center gap-3 flex-wrap">{children}</div>
    </div>
  );
}

function PersonDetailSheet({ person, isDeceased, memorialId, onClose, onUpdate, isOwner }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("view"); // "view" | "edit" | "link"
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myMemorials, setMyMemorials] = useState([]);
  const [loadingMemorials, setLoadingMemorials] = useState(false);
  const [editForm, setEditForm] = useState({
    notes: person.notes || "",
    birth_year: person.birth_year || "",
    death_year: person.death_year || "",
  });

  const initials = person.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hasProfile = person.notes || person.photo_url || person.birth_year;
  const hasLinked = !!person.linked_memorial_short_id;
  const isEmpty = !hasProfile && !hasLinked && !isDeceased;

  useEffect(() => {
    if (isEmpty && isOwner) setMode("edit");
  }, []);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.FamilyMember.update(person.id, { photo_url: file_url });
      onUpdate({ ...person, photo_url: file_url });
    } catch (err) {
      console.error("Upload fehlgeschlagen:", err);
    }
    e.target.value = "";
    setUploading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.entities.FamilyMember.update(person.id, editForm);
      onUpdate({ ...person, ...editForm });
      setMode("view");
    } catch (err) {
      console.error("Speichern fehlgeschlagen:", err);
    }
    setSaving(false);
  };

  const startLinking = async () => {
    setMode("link");
    setLoadingMemorials(true);
    try {
      const all = await base44.entities.Memorial.list();
      setMyMemorials(all.filter(m => m.id !== memorialId && m.short_id));
    } catch {
      setMyMemorials([]);
    }
    setLoadingMemorials(false);
  };

  const linkMemorial = async (shortId) => {
    setSaving(true);
    try {
      await base44.entities.FamilyMember.update(person.id, { linked_memorial_short_id: shortId });
      onUpdate({ ...person, linked_memorial_short_id: shortId });
      setMode("view");
    } catch (err) {}
    setSaving(false);
  };

  const unlinkMemorial = async () => {
    setSaving(true);
    try {
      await base44.entities.FamilyMember.update(person.id, { linked_memorial_short_id: "" });
      onUpdate({ ...person, linked_memorial_short_id: "" });
    } catch (err) {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(10,5,2,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[88vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}>

        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-300" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}>
          <X className="w-4 h-4 text-stone-500" />
        </button>

        {/* HEADER */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {person.photo_url ? (
                <div className={`rounded-2xl overflow-hidden flex items-center justify-center font-bold shadow-md ${isDeceased ? "w-16 h-16 text-lg" : "w-14 h-14 text-base"}`}
                  style={{
                    background: isDeceased ? "linear-gradient(135deg, #92400e, #c9a96e)" : "transparent",
                    color: isDeceased ? "white" : "#6b5a44",
                  }}>
                  <img src={person.photo_url} className="w-full h-full object-cover object-face" alt={person.name} />
                </div>
              ) : isOwner && !isDeceased ? (
                <label className={`rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-amber-400 ${isDeceased ? "w-16 h-16" : "w-14 h-14"}`}
                  style={{
                    background: "linear-gradient(135deg, #e7e2db, #d8d0c4)",
                    border: "2px dashed #c9a96e",
                  }}>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#c9a96e" }} />
                  ) : (
                    <Camera className="w-5 h-5" style={{ color: "#c9a96e" }} />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                </label>
              ) : (
                <div className={`rounded-2xl flex items-center justify-center font-bold ${isDeceased ? "w-16 h-16 text-lg" : "w-14 h-14 text-base"}`}
                  style={{
                    background: isDeceased ? "linear-gradient(135deg, #92400e, #c9a96e)" : "linear-gradient(135deg, #e7e2db, #d8d0c4)",
                    color: isDeceased ? "white" : "#6b5a44",
                  }}>
                  {initials}
                </div>
              )}
              {person.photo_url && !isDeceased && isOwner && mode !== "link" && (
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                  style={{ background: "#c9a96e", border: "2px solid white" }}>
                  {uploading ? <Loader2 className="w-2.5 h-2.5 text-white animate-spin" /> : <Camera className="w-2.5 h-2.5 text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                </label>
              )}
            </div>
            </div>
          </div>

        <div className="mx-6 h-px" style={{ background: "linear-gradient(90deg, transparent, #e8dfd0, transparent)" }} />

        {/* CONTENT */}
        <div className="px-6 py-4 space-y-3">
          {mode === "view" && (
            <>
              {person.notes && <div className="p-3 rounded-xl" style={{ background: "#FAF8F4" }}><p className="text-sm text-gray-600 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>„{person.notes}"</p></div>}
              {isEmpty && isOwner && <p className="text-xs text-center py-2" style={{ color: "#a09080" }}>Noch keine Informationen hinterlegt</p>}
              {isEmpty && !isOwner && <p className="text-xs text-center py-4" style={{ color: "#a09080" }}>{person.name.split(" ")[0]} — {REL[person.relation] || "Familienmitglied"}</p>}
              {isOwner && !isDeceased && (
                <div className="space-y-2 pt-1">
                  <button onClick={() => setMode("edit")} className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all active:scale-[0.98]" style={{ background: !hasProfile ? "#c9a96e" : "#FAF8F4", color: !hasProfile ? "#0f0e0c" : "#6b7280", border: hasProfile ? "1px solid #e5e7eb" : "none" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: !hasProfile ? "rgba(255,255,255,0.2)" : "#e7e2db" }}>{hasProfile ? <Edit3 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}</div>
                    <span className="font-medium">{hasProfile ? "Steckbrief bearbeiten" : "Steckbrief & Foto anlegen"}</span>
                  </button>
                  {!hasLinked && <button onClick={startLinking} className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all active:scale-[0.98]" style={{ background: "white", color: "#2c2419", border: "1px solid #e5e7eb" }}><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FAF8F4" }}><Link2 className="w-3 h-3" style={{ color: "#c9a96e" }} /></div><span className="font-medium">Gedenkseite verknüpfen</span></button>}
                  {!hasLinked && <button onClick={() => navigate(`/CreateMemorial?prefill_name=${encodeURIComponent(person.name)}`)} className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all active:scale-[0.98]" style={{ background: "white", color: "#8a8278", border: "1px solid #e5e7eb" }}><div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FAF8F4" }}><ExternalLink className="w-3 h-3" style={{ color: "#8a8278" }} /></div><span className="font-medium">Neue Gedenkseite erstellen</span></button>}
                </div>
              )}
              {hasLinked && <div className="space-y-2 pt-1"><button onClick={() => navigate(`/MemorialProfile?id=${person.linked_memorial_short_id}`)} className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: "rgba(201,169,110,0.1)", color: "#a07830", border: "1px solid rgba(201,169,110,0.3)" }}><ExternalLink className="w-3.5 h-3.5" /> Zur Gedenkseite</button>{isOwner && <button onClick={unlinkMemorial} disabled={saving} className="w-full py-1.5 text-xs text-center" style={{ color: "#a09080" }}>Verknüpfung entfernen</button>}</div>}
            </>
          )}
          {mode === "edit" && (
            <div className="space-y-3">
              {!person.photo_url && !isDeceased && <label className="block w-full p-4 rounded-xl text-center cursor-pointer transition-all hover:border-amber-400" style={{ border: "2px dashed #e8dfd0", background: "#FDFCFA" }}>{uploading ? <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: "#c9a96e" }} /> : <><Camera className="w-6 h-6 mx-auto mb-1" style={{ color: "#c9a96e" }} /><p className="text-xs font-medium" style={{ color: "#6b7280" }}>Foto hochladen</p><p className="text-xs" style={{ color: "#a09080" }}>Tippen zum Auswählen</p></> }<input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} /></label>}
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs block mb-1" style={{ color: "#8a8278" }}>Geburtsjahr</label><Input value={editForm.birth_year} onChange={e => setEditForm(f => ({ ...f, birth_year: e.target.value }))} placeholder="1945" className="text-sm" /></div>
                <div><label className="text-xs block mb-1" style={{ color: "#8a8278" }}>Todesjahr</label><Input value={editForm.death_year} onChange={e => setEditForm(f => ({ ...f, death_year: e.target.value }))} placeholder="2010" className="text-sm" /></div>
              </div>
              <div><label className="text-xs block mb-1" style={{ color: "#8a8278" }}>Persönliche Erinnerung</label><Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="z.B. Liebte ihren Garten und hat die besten Kuchen gebacken…" className="text-sm resize-none h-20" /></div>
              <div className="flex gap-2 pt-1"><button onClick={() => setMode("view")} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "#FAF8F4", color: "#6b7280" }}>Abbrechen</button><button onClick={saveProfile} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5" style={{ background: "#c9a96e", color: "#0f0e0c" }}>{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Speichern</button></div>
            </div>
          )}
          {mode === "link" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-700">Gedenkseite verknüpfen</p><button onClick={() => setMode("view")} className="text-xs" style={{ color: "#c9a96e" }}>Abbrechen</button></div>
              {loadingMemorials ? <div className="flex items-center justify-center py-8 text-stone-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Laden…</div> : myMemorials.length === 0 ? <div className="text-center py-6"><p className="text-sm text-stone-400 mb-3">Keine weiteren Gedenkseiten vorhanden.</p><button onClick={() => navigate(`/CreateMemorial?prefill_name=${encodeURIComponent(person.name)}`)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Jetzt erstellen</button></div> : <div className="space-y-2 max-h-56 overflow-y-auto">{myMemorials.map(m => <button key={m.id} onClick={() => linkMemorial(m.short_id)} disabled={saving} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98] disabled:opacity-50" style={{ background: "white", border: "1px solid #e5e7eb" }}><div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: m.hero_image_url ? "transparent" : "#e7e2db" }}>{m.hero_image_url ? <img src={m.hero_image_url} className="w-full h-full object-cover object-face" alt="" /> : <span className="text-xs font-semibold" style={{ color: "#6b5a44" }}>{m.name?.[0]}</span>}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-800 truncate">{m.name}</p><p className="text-xs text-stone-400">{m.birth_date?.slice(0, 4) || "?"} – {m.death_date?.slice(0, 4) || "?"}</p></div><Link2 className="w-4 h-4 flex-shrink-0" style={{ color: "#c9a96e" }} /></button>)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FamilyTreeSection({ memorial, isOwner = false }) {
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
    _isDeceased: true,
  };

  const onSelect = (person, isDec = false) => setSelected({ person, isDeceased: isDec });
  
  const handleUpdate = (updated) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelected(s => s ? { ...s, person: updated } : null);
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6" style={{ background: "#FAF8F4" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Familie</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Stammbaum
          </h2>
        </div>

        <div className="flex flex-col items-center">
          {grandparents.length > 0 && (
            <>
              <GenerationRow label="Großeltern">
                {grandparents.map(m => (
                  <PersonBubble key={m.id} person={m} size="sm" onClick={() => onSelect(m)} />
                ))}
              </GenerationRow>
              <ConnectorLine />
            </>
          )}

          {parents.length > 0 && (
            <>
              <GenerationRow label="Eltern">
                {parents.map(m => (
                  <PersonBubble key={m.id} person={m} size="md" onClick={() => onSelect(m)} />
                ))}
              </GenerationRow>
              <ConnectorLine />
            </>
          )}

          <GenerationRow>
            {siblings.map(m => (
              <PersonBubble key={m.id} person={m} size="md" onClick={() => onSelect(m)} />
            ))}
            {siblings.length > 0 && <HorizontalConnector />}
            <PersonBubble person={deceased} isDeceased size="lg" onClick={() => onSelect(deceased, true)} />
            {spouses.length > 0 && <HorizontalConnector />}
            {spouses.map(m => (
              <PersonBubble key={m.id} person={m} size="md" onClick={() => onSelect(m)} />
            ))}
          </GenerationRow>

          {children.length > 0 && (
            <>
              <ConnectorLine />
              <GenerationRow label="Kinder">
                {children.map(m => (
                  <PersonBubble key={m.id} person={m} size="md" onClick={() => onSelect(m)} />
                ))}
              </GenerationRow>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-stone-400 italic">
            Familienmitglied antippen für Profil und Details
          </p>
        </div>
      </div>

      {selected && (
        <PersonDetailSheet
          person={selected.person}
          isDeceased={selected.isDeceased}
          memorialId={memorial.id}
          isOwner={isOwner}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .touch-target {
          min-width: 44px;
          min-height: 44px;
        }
      `}</style>
    </section>
  );
}