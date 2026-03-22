import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// Fix 2: Prompt Injection Sanitization
function sanitizePromptInput(str, maxLength = 500) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[<>\"\'`]/g, "")
    .replace(/\b(ignore|system|assistant|instructions|prompt|override|jailbreak|disregard)\b/gi, "")
    .replace(/\s{3,}/g, " ")
    .trim()
    .slice(0, maxLength);
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ArrowLeft, Upload, Plus, Trash2, Sparkles, Eye, CreditCard, BookOpen, QrCode } from "lucide-react";
import DateInput from "@/components/ui/DateInput";
import FamilyEditor from "@/components/memorial/FamilyEditor";
import TimelineEditor from "@/components/memorial/TimelineEditor";
import QrSharePanel from "@/components/memorial/QrSharePanel";
import AudioUploader from "@/components/memorial/AudioUploader";
import CuratedMusicLibrary from "@/components/memorial/CuratedMusicLibrary";
import LegacyEditor from "@/components/memorial/LegacyEditor";
import ServiceEventEditor from "@/components/memorial/ServiceEventEditor";
import MemoryWallModerator from "@/components/memorial/MemoryWallModerator";

import { CURATED_TRACKS } from "@/components/memorial/curatedTracksData";

export default function EditMemorial() {
  const [memorial, setMemorial] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [newEvent, setNewEvent] = useState({ year: "", title: "", description: "" });
  const [musicTabView, setMusicTabView] = useState("spotify");
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingCondolences, setPendingCondolences] = useState([]);
  const [pendingMemoryWall, setPendingMemoryWall] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = createPageUrl("Dashboard"); return; }
    Promise.all([
      base44.entities.Memorial.filter({ id }),
      base44.entities.TimelineEvent.filter({ memorial_id: id }, "sort_order"),
      base44.entities.CondolenceEntry.filter({ memorial_id: id, status: "pending" }),
      base44.entities.MemoryWallEntry.filter({ memorial_id: id, status: "pending" }),
    ]).then(([memorials, events, pendCond, pendWall]) => {
      if (memorials.length) setMemorial(memorials[0]);
      setTimeline(events);
      setPendingCondolences(pendCond);
      setPendingMemoryWall(pendWall);
      setPendingCount(pendCond.length + pendWall.length);
      setLoading(false);
    });
  }, []);

  const [isDirty, setIsDirty] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);

  const set = (k, v) => { setMemorial((p) => ({ ...p, [k]: v })); setIsDirty(true); };

  const save = async () => {
    setSaving(true);
    await base44.entities.Memorial.update(memorial.id, memorial);
    setSaving(false);
    setIsDirty(false);
  };

  const uploadHero = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("hero_image_url", file_url);
    setUploading(false);
  };

  const uploadGallery = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = await Promise.all(files.map((f) => base44.integrations.Core.UploadFile({ file: f }).then((r) => r.file_url)));
    set("gallery_images", [...(memorial.gallery_images || []), ...urls]);
    setUploading(false);
  };

  const removeGalleryImage = (idx) => {
    set("gallery_images", memorial.gallery_images.filter((_, i) => i !== idx));
  };

  const generateBio = async () => {
    if (!memorial.biography_raw_input) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
     prompt: `Erstelle eine ${memorial.biography_style || "chronologisch"} Biografie auf Deutsch für ${memorial.name} (geboren: ${memorial.birth_date || "unbekannt"}, gestorben: ${memorial.death_date || "unbekannt"}). Basiere auf: "${sanitizePromptInput(memorial.biography_raw_input)}". 3–4 Absätze, würdevoll. Beginne direkt.`,
    });
    set("biography", result);
    setGenerating(false);
  };

  const addEvent = async () => {
    if (!newEvent.year || !newEvent.title) return;
    const ev = await base44.entities.TimelineEvent.create({ ...newEvent, memorial_id: memorial.id, sort_order: timeline.length });
    setTimeline((p) => [...p, ev]);
    setNewEvent({ year: "", title: "", description: "" });
  };

  const deleteEvent = async (id) => {
    await base44.entities.TimelineEvent.delete(id);
    setTimeline((p) => p.filter((e) => e.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#c9a96e" }} /></div>;
  if (!memorial) return null;

  const TAB_GUIDANCE = {
    info: "Name, Daten und Leitspruch der verstorbenen Person.",
    bio: "Erzählen Sie uns Erinnerungen — die KI verfasst daraus eine würdevolle Geschichte.",
    media: "Laden Sie Fotos hoch und verknüpfen Sie Lieblingsmusik.",
    timeline: "Wichtige Momente und Stationen aus dem Leben der Person.",
    legacy: "Was hat diese Person für andere Menschen bedeutet?",
    events: "Informationen zur Trauerfeier, die Besucher sehen können.",
    wall: "Nachrichten von Freunden und Familie — Sie entscheiden, was sichtbar ist.",
    family: "Familienmitglieder und ihr Stammbaum.",
    settings: "Sichtbarkeit, Passwortschutz und QR-Code Ihrer Gedenkseite.",
  };

  const tabs = [
    { id: "info", label: "Steckbrief" },
    { id: "bio", label: "Lebensgeschichte" },
    { id: "media", label: "Fotos & Musik" },
    { id: "timeline", label: "Lebensstationen" },
    { id: "legacy", label: "Besonderes Erbe" },
    { id: "events", label: "Trauerfeier" },
    { id: "wall", label: "Erinnerungen" },
    { id: "family", label: "Familie" },
    { id: "settings", label: "Einstellungen" },
    { id: "approvals", label: pendingCount > 0 ? `Freigaben` : "Freigaben", badge: pendingCount },
  ];

  const showGuidanceBanner = showGuidance && !memorial.biography?.trim() && (memorial.gallery_images?.length || 0) < 2;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = createPageUrl("Dashboard")} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#2c2419", fontWeight: 600 }}>{memorial.name}</h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a8278" }}>Alles, was Sie hinzufügen, macht die Erinnerung reicher.</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline" size="sm" className="rounded-xl text-xs"
              onClick={() => window.location.href = createPageUrl("CardDesigner") + `?id=${memorial.id}`}
              style={{ borderColor: "rgba(201,169,110,0.4)", color: "#c9a96e" }}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" /> Trauerkarte gestalten
            </Button>
            <Button
              variant="outline" size="sm" className="rounded-xl text-xs"
              onClick={() => window.location.href = createPageUrl("MemoryBook") + `?id=${memorial.id}`}
              style={{ borderColor: "#1e3a5f", color: "#1e3a5f" }}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Erinnerungsbuch
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => window.open(`/MemorialProfile?id=${memorial.short_id}`, "_blank")}>
              <Eye className="w-4 h-4 mr-1" /> Vorschau
            </Button>
            <Button size="sm" onClick={save} disabled={saving} className="rounded-xl text-white flex items-center gap-1.5" style={{ background: "#c9a96e" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Änderungen speichern
              {isDirty && !saving && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-6">
          <div className="flex gap-1 overflow-x-auto pb-1 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setTimeout(() => {
                    document.querySelector('[data-active-tab]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }, 0);
                }}
                data-active-tab={activeTab === t.id}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
              style={{
                background: activeTab === t.id ? "#c9a96e" : "white",
                color: activeTab === t.id ? "white" : "#6b7280",
                border: `1px solid ${activeTab === t.id ? "#c9a96e" : "#e5e7eb"}`,
              }}
            >
                {t.label}
                {t.badge > 0 && (
                  <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "#ef4444", color: "white", fontSize: 10 }}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none md:hidden" style={{ background: 'linear-gradient(to left, #FAFAF8, transparent)' }} />
        </div>

        {/* Guidance banner */}
        {showGuidanceBanner && (
          <div className="mb-4 relative rounded-xl p-5" style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <button onClick={() => setShowGuidance(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#c9a96e", fontWeight: 500, marginBottom: 12 }}>Empfohlene nächste Schritte</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "rgba(201,169,110,0.2)", color: "#c9a96e" }}>1</div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2c2419" }}>Lebensgeschichte verfassen lassen</span>
                </div>
                <button onClick={() => setActiveTab("bio")} style={{ fontSize: 12, color: "#c9a96e", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Jetzt starten →</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "rgba(201,169,110,0.2)", color: "#c9a96e" }}>2</div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2c2419" }}>Fotos hochladen</span>
                </div>
                <button onClick={() => setActiveTab("media")} style={{ fontSize: 12, color: "#c9a96e", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Fotos hinzufügen →</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          {/* Tab guidance text */}
          {TAB_GUIDANCE[activeTab] && (
            <p style={{ fontSize: 13, color: "#8a8278", fontStyle: "italic", marginBottom: 16 }}>{TAB_GUIDANCE[activeTab]}</p>
          )}

          {activeTab === "info" && (
            <div className="space-y-4">
              <div><Label>Vollständiger Name</Label><Input value={memorial.name || ""} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Geburtsdatum</Label><DateInput value={memorial.birth_date || ""} onChange={(v) => set("birth_date", v)} className="mt-1 w-full" /></div>
                <div><Label>Sterbedatum</Label><DateInput value={memorial.death_date || ""} onChange={(v) => set("death_date", v)} className="mt-1 w-full" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Geburtsort</Label><Input value={memorial.birth_place || ""} onChange={(e) => set("birth_place", e.target.value)} className="mt-1" /></div>
                <div><Label>Sterbeort</Label><Input value={memorial.death_place || ""} onChange={(e) => set("death_place", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Leitspruch</Label><Input value={memorial.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} className="mt-1" /></div>
            </div>
          )}

          {activeTab === "bio" && (
            <div className="space-y-4">
              <div>
                <Label>Was sollen Menschen über ihn/sie wissen?</Label>
                <Textarea value={memorial.biography_raw_input || ""} onChange={(e) => set("biography_raw_input", e.target.value)} className="mt-1 h-28 resize-none"
                  placeholder="Schreiben Sie einfach, was Ihnen einfällt — zum Beispiel: Wo er/sie aufgewachsen ist, was ihn/sie begeistert hat, was er/sie geliebt hat, welche Eigenschaften ihn/sie besonders gemacht haben. Auch kurze Notizen sind vollkommen ausreichend." />
              </div>
              <Button onClick={generateBio} disabled={generating || !memorial.biography_raw_input} className="w-full text-white rounded-xl" style={{ background: "#c9a96e" }}>
                {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wir schreiben gerade die Lebensgeschichte…</> : <>✦ Lebensgeschichte neu verfassen lassen</>}
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Lebensgeschichte (bearbeitbar)</Label>
                </div>
                <p style={{ fontSize: 11, color: "#8a8278", marginBottom: 4 }}>Sie können den Text direkt hier anpassen.</p>
                <Textarea value={memorial.biography || ""} onChange={(e) => set("biography", e.target.value)} className="mt-1 h-64 resize-none" placeholder="Biografie hier eingeben oder von der KI verfassen lassen..." />
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <Label>Ein Foto, das ihn/sie zeigt wie er/sie war</Label>
                <div className="mt-2 border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:border-amber-400 transition-colors">
                  {memorial.hero_image_url ? (
                    <div>
                      <img src={memorial.hero_image_url} className="w-24 h-24 object-cover rounded-full mx-auto" alt="Portrait"
                        style={{ objectPosition: `center ${memorial.hero_image_position ?? 50}%` }} />
                      <button className="mt-2 text-xs text-gray-400 hover:text-red-500" onClick={() => set("hero_image_url", "")}>Entfernen</button>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Bildausschnitt anpassen</p>
                        <input type="range" min={0} max={100} value={memorial.hero_image_position ?? 50}
                          onChange={e => set("hero_image_position", parseInt(e.target.value))}
                          className="w-full" />
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-7 h-7 mx-auto text-stone-400 mb-2" />
                      <p className="text-sm text-gray-500">{uploading ? "Lädt hoch..." : "Klicken zum Hochladen"}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={uploadHero} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Weitere Fotos</Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {(memorial.gallery_images || []).map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} className="w-full h-full object-cover" alt={`Bild ${i + 1}`} />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full items-center justify-center hidden group-hover:flex text-white">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-stone-400" /> : <><Plus className="w-5 h-5 text-stone-400" /><span className="text-xs text-stone-400 mt-1">+ Foto hinzufügen</span></>}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={uploadGallery} disabled={uploading} />
                  </label>
                </div>
                <p style={{ fontSize: 11, color: "#8a8278", marginTop: 8 }}>Alle Fotos werden sicher gespeichert. Sie können die Reihenfolge durch Ziehen ändern.</p>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <Label className="block mb-4">Musik & Audio</Label>
                <div className="flex gap-2 mb-6">
                  {["spotify", "curated", "uploads"].map(v => (
                    <button
                      key={v}
                      onClick={() => setMusicTabView(v)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: musicTabView === v ? "#c9a96e" : "white",
                        color: musicTabView === v ? "white" : "#6b7280",
                        border: `1px solid ${musicTabView === v ? "#c9a96e" : "#e5e7eb"}`,
                      }}
                    >
                      {v === "spotify" ? "Spotify-Playlist" : v === "curated" ? "Trauermusik-Bibliothek" : "Eigene Aufnahmen"}
                    </button>
                  ))}
                </div>

                {musicTabView === "spotify" && (
                  <div>
                    <Label>Spotify-Playlist verknüpfen</Label>
                    <p style={{ fontSize: 12, color: "#8a8278", fontFamily: "'DM Sans', sans-serif", marginTop: 4, marginBottom: 8 }}>
                      Fügen Sie den Link zu einer öffentlichen Spotify-Playlist ein. Die Musik wird direkt auf der Gedenkseite eingebettet. Hörer benötigen keinen Spotify-Account für 30-Sekunden-Vorschauen.
                    </p>
                    <Input value={memorial.spotify_url || ""} onChange={(e) => set("spotify_url", e.target.value)} placeholder="https://open.spotify.com/playlist/..." className="mt-2" />
                    {memorial.spotify_url && (
                      <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                        <iframe
                          src={(() => {
                            const match = memorial.spotify_url.match(/spotify\.com\/(playlist|track)\/([a-zA-Z0-9]+)/);
                            if (!match) return "";
                            const [, type, id] = match;
                            return `https://open.spotify.com/embed/${type}/${id}`;
                          })()}
                          width="100%"
                          height={152}
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          style={{ borderRadius: 12, border: "none" }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {musicTabView === "curated" && (
                  <div>
                    <CuratedMusicLibrary 
                      selectedIds={memorial.curated_track_ids || []}
                      onSelectionChange={(ids) => set("curated_track_ids", ids)}
                    />
                  </div>
                )}

                {musicTabView === "uploads" && (
                  <AudioUploader memorialId={memorial.id} />
                )}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <TimelineEditor memorialId={memorial.id} timeline={timeline} setTimeline={setTimeline} />
          )}

          {activeTab === "legacy" && (
            <LegacyEditor memorialId={memorial.id} />
          )}

          {activeTab === "events" && (
            <ServiceEventEditor memorialId={memorial.id} />
          )}

          {activeTab === "wall" && (
            <MemoryWallModerator memorialId={memorial.id} />
          )}

          {activeTab === "family" && (
            <FamilyEditor memorialId={memorial.id} />
          )}

          {activeTab === "approvals" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Ausstehende Kondolenzeinträge ({pendingCondolences.length})</p>
                {pendingCondolences.length === 0 ? <p className="text-sm text-gray-400">Keine ausstehenden Einträge.</p> : (
                  <div className="space-y-3">
                    {pendingCondolences.map(c => (
                      <div key={c.id} className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid #e8dfd0" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">{c.author_name}</p>
                            <p className="text-xs text-gray-400 mb-1">{c.created_date ? new Date(c.created_date).toLocaleDateString("de-DE") : ""}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{c.message}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={async () => { await base44.entities.CondolenceEntry.update(c.id, { status: "approved" }); const updated = pendingCondolences.filter(x => x.id !== c.id); setPendingCondolences(updated); setPendingCount(updated.length + pendingMemoryWall.length); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Freigeben</button>
                            <button onClick={async () => { await base44.entities.CondolenceEntry.update(c.id, { status: "rejected" }); const updated = pendingCondolences.filter(x => x.id !== c.id); setPendingCondolences(updated); setPendingCount(updated.length + pendingMemoryWall.length); }} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>Ablehnen</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Ausstehende Erinnerungen ({pendingMemoryWall.length})</p>
                {pendingMemoryWall.length === 0 ? <p className="text-sm text-gray-400">Keine ausstehenden Erinnerungen.</p> : (
                  <div className="space-y-3">
                    {pendingMemoryWall.map(w => (
                      <div key={w.id} className="rounded-xl p-4" style={{ background: "#fafaf8", border: "1px solid #e8dfd0" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">{w.author_name}</p>
                            {w.relation && <p className="text-xs text-gray-400">{w.relation}</p>}
                            <p className="text-xs text-gray-400 mb-1">{w.created_date ? new Date(w.created_date).toLocaleDateString("de-DE") : ""}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{w.message}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={async () => { await base44.entities.MemoryWallEntry.update(w.id, { status: "approved" }); const updated = pendingMemoryWall.filter(x => x.id !== w.id); setPendingMemoryWall(updated); setPendingCount(pendingCondolences.length + updated.length); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Freigeben</button>
                            <button onClick={async () => { await base44.entities.MemoryWallEntry.update(w.id, { status: "rejected" }); const updated = pendingMemoryWall.filter(x => x.id !== w.id); setPendingMemoryWall(updated); setPendingCount(pendingCondolences.length + updated.length); }} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>Ablehnen</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">

              {/* Section visibility */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Sichtbarkeit der Sektionen</p>
                {[
                  { key: "biography", label: "Biografie" },
                  { key: "gallery", label: "Galerie" },
                  { key: "family", label: "Stammbaum" },
                  { key: "timeline", label: "Lebensstationen" },
                  { key: "legacy", label: "Lebenswerk" },
                  { key: "memorywall", label: "Erinnerungswand" },
                  { key: "audio", label: "Audio" },
                  { key: "events", label: "Trauerfeier" },
                ].map(({ key, label }) => {
                  const visibility = memorial.section_visibility?.[key] || "public";
                  const opts = [{ id: "public", label: "Öffentlich" }, { id: "family", label: "Familie" }, { id: "private", label: "Privat" }];
                  return (
                    <div key={key} className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div className="flex rounded-lg overflow-hidden border border-stone-200">
                        {opts.map(o => (
                          <button key={o.id} onClick={() => set("section_visibility", { ...(memorial.section_visibility || {}), [key]: o.id })}
                            className="px-3 py-1 text-xs transition-all"
                            style={{ background: visibility === o.id ? "#c9a96e" : "white", color: visibility === o.id ? "#0f0e0c" : "#6b7280" }}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {Object.values(memorial.section_visibility || {}).includes("family") && (
                  <div className="mt-3">
                    <Label>Passwort für Familienbereich</Label>
                    <Input value={memorial.family_password || ""} onChange={(e) => set("family_password", e.target.value)} className="mt-1" placeholder="Familienpasswort" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer" onClick={() => set("is_private", !memorial.is_private)}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: memorial.is_private ? "#c9a96e" : "#d1d5db", background: memorial.is_private ? "#c9a96e" : "white" }}>
                  {memorial.is_private && <span className="text-white text-xs">✓</span>}
                </div>
                <div><p className="text-sm font-medium text-gray-700">Gedenkseite schützen</p><p className="text-xs text-gray-400">Nur Personen mit dem Passwort können die Seite sehen.</p></div>
              </div>
              {memorial.is_private && (
                <div><Label>Passwort</Label><Input value={memorial.access_password || ""} onChange={(e) => set("access_password", e.target.value)} className="mt-1" /></div>
              )}
              <div>
                <Label>QR-Code & Teilen</Label>
                <QrSharePanel memorial={memorial} />
              </div>
            </div>
          )}
        </div>
      {/* Upsell banner */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #1a1410, #2a1e0a)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 12, padding: "16px 20px" }}>
        <div className="flex items-center gap-3">
          <QrCode className="w-5 h-5 flex-shrink-0" style={{ color: "#c9a96e" }} />
          <div>
            <p className="font-medium" style={{ color: "#f0ede8" }}>QR-Plakette für das Grab</p>
            <p className="text-xs mt-0.5" style={{ color: "#8a8278" }}>Besucher scannen den Code direkt am Grabstein</p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = `/Shop?memorial_id=${memorial.short_id}`}
          className="whitespace-nowrap px-4 py-2 font-medium flex-shrink-0"
          style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 8, fontSize: 13 }}
        >
          Jetzt bestellen ab € 129,–
        </button>
      </div>
      </div>
    </div>
  );
}