import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ArrowLeft, Upload, Plus, Trash2, Sparkles, Eye, CreditCard, BookOpen } from "lucide-react";
import FamilyEditor from "@/components/memorial/FamilyEditor";
import TimelineEditor from "@/components/memorial/TimelineEditor";
import QrSharePanel from "@/components/memorial/QrSharePanel";
import AudioUploader from "@/components/memorial/AudioUploader";
import LegacyEditor from "@/components/memorial/LegacyEditor";
import ServiceEventEditor from "@/components/memorial/ServiceEventEditor";
import MemoryWallModerator from "@/components/memorial/MemoryWallModerator";

export default function EditMemorial() {
  const [memorial, setMemorial] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [newEvent, setNewEvent] = useState({ year: "", title: "", description: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = createPageUrl("Dashboard"); return; }
    Promise.all([
      base44.entities.Memorial.filter({ id }),
      base44.entities.TimelineEvent.filter({ memorial_id: id }, "sort_order"),
    ]).then(([memorials, events]) => {
      if (memorials.length) setMemorial(memorials[0]);
      setTimeline(events);
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setMemorial((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    await base44.entities.Memorial.update(memorial.id, memorial);
    setSaving(false);
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
      prompt: `Erstelle eine ${memorial.biography_style || "chronologisch"} Biografie auf Deutsch für ${memorial.name} (geboren: ${memorial.birth_date || "unbekannt"}, gestorben: ${memorial.death_date || "unbekannt"}). Basiere auf: "${memorial.biography_raw_input}". 3–4 Absätze, würdevoll. Beginne direkt.`,
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

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-amber-700" /></div>;
  if (!memorial) return null;

  const tabs = [
    { id: "info", label: "Grunddaten" },
    { id: "bio", label: "Biografie" },
    { id: "media", label: "Medien" },
    { id: "timeline", label: "Timeline" },
    { id: "legacy", label: "Lebenswerk" },
    { id: "events", label: "Veranstaltungen" },
    { id: "wall", label: "Erinnerungswand" },
    { id: "family", label: "Stammbaum" },
    { id: "settings", label: "Einstellungen" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = createPageUrl("Dashboard")} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{memorial.name}</h1>
              <p className="text-gray-500 text-sm">Gedenkseite bearbeiten</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline" size="sm" className="rounded-xl text-xs"
              onClick={() => window.location.href = createPageUrl("CardDesigner") + `?id=${memorial.id}`}
              style={{ borderColor: "#c9a84c", color: "#a07830" }}
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
            <Button size="sm" onClick={save} disabled={saving} className="rounded-xl text-white" style={{ background: "#b45309" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Speichern
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === t.id ? "#b45309" : "white",
                color: activeTab === t.id ? "white" : "#6b7280",
                border: `1px solid ${activeTab === t.id ? "#b45309" : "#e5e7eb"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div><Label>Vollständiger Name</Label><Input value={memorial.name || ""} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Geburtsdatum</Label><Input type="date" value={memorial.birth_date || ""} onChange={(e) => set("birth_date", e.target.value)} className="mt-1" /></div>
                <div><Label>Sterbedatum</Label><Input type="date" value={memorial.death_date || ""} onChange={(e) => set("death_date", e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Geburtsort</Label><Input value={memorial.birth_place || ""} onChange={(e) => set("birth_place", e.target.value)} className="mt-1" /></div>
                <div><Label>Sterbeort</Label><Input value={memorial.death_place || ""} onChange={(e) => set("death_place", e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Leitspruch</Label><Input value={memorial.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} className="mt-1" /></div>
              <div><Label>Spotify-URL</Label><Input value={memorial.spotify_url || ""} onChange={(e) => set("spotify_url", e.target.value)} placeholder="https://open.spotify.com/playlist/..." className="mt-1" /></div>
            </div>
          )}

          {activeTab === "bio" && (
            <div className="space-y-4">
              <div>
                <Label>Rohfakten & Erinnerungen</Label>
                <Textarea value={memorial.biography_raw_input || ""} onChange={(e) => set("biography_raw_input", e.target.value)} className="mt-1 h-28 resize-none" placeholder={`Erzählen Sie uns von besonderen Momenten im Leben von ${memorial.name}. Beruf, Leidenschaften, Lieblingsplätze, unvergessliche Erlebnisse...`} />
              </div>
              <Button onClick={generateBio} disabled={generating || !memorial.biography_raw_input} className="w-full text-white rounded-xl" style={{ background: "#b45309" }}>
                {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wird verfasst...</> : <><Sparkles className="w-4 h-4 mr-2" /> Lebensgeschichte neu verfassen</>}
              </Button>
              <div>
                <Label>Biografie</Label>
                <Textarea value={memorial.biography || ""} onChange={(e) => set("biography", e.target.value)} className="mt-1 h-64 resize-none" placeholder="Biografie hier eingeben oder generieren..." />
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <Label>Portrait-Foto</Label>
                <div className="mt-2 border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:border-amber-400 transition-colors">
                  {memorial.hero_image_url ? (
                    <div>
                      <img src={memorial.hero_image_url} className="w-24 h-24 object-cover rounded-full mx-auto" alt="Portrait" />
                      <button className="mt-2 text-xs text-gray-400 hover:text-red-500" onClick={() => set("hero_image_url", "")}>Entfernen</button>
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
                <Label>Galerie</Label>
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
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-stone-400" /> : <><Plus className="w-5 h-5 text-stone-400" /><span className="text-xs text-stone-400 mt-1">Hinzufügen</span></>}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={uploadGallery} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <AudioUploader memorialId={memorial.id} />
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

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer" onClick={() => set("is_private", !memorial.is_private)}>
                <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: memorial.is_private ? "#b45309" : "#d1d5db", background: memorial.is_private ? "#b45309" : "white" }}>
                  {memorial.is_private && <span className="text-white text-xs">✓</span>}
                </div>
                <div><p className="text-sm font-medium text-gray-700">Private Gedenkseite</p><p className="text-xs text-gray-400">Passwortgeschützt</p></div>
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
      </div>
    </div>
  );
}