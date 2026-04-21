import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, Loader2, Upload, Pencil, Check, X,
  Baby, Heart, Star, GraduationCap, Briefcase, MapPin, Music, Camera
} from "lucide-react";
import { detectFacePosition } from "@/utils/faceDetection";

const EVENT_TYPES = [
  { value: "geburt",      label: "Geburt",        icon: Baby,          color: "#f0abfc" },
  { value: "hochzeit",    label: "Hochzeit",       icon: Heart,         color: "#fca5a5" },
  { value: "meilenstein", label: "Meilenstein",    icon: Star,          color: "#fcd34d" },
  { value: "bildung",     label: "Bildung",        icon: GraduationCap, color: "#6ee7b7" },
  { value: "beruf",       label: "Beruf",          icon: Briefcase,     color: "#93c5fd" },
  { value: "reise",       label: "Reise / Umzug",  icon: MapPin,        color: "#fdba74" },
  { value: "leidenschaft",label: "Leidenschaft",   icon: Music,         color: "#c4b5fd" },
  { value: "erinnerung",  label: "Erinnerung",     icon: Camera,        color: "#a3e635" },
];

function getType(val) {
  return EVENT_TYPES.find((t) => t.value === val) || EVENT_TYPES[2];
}

function EventRow({ ev, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ev);
  const [uploading, setUploading] = useState(false);
  const type = getType(ev.event_type);
  const Icon = type.icon;

  const uploadImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    let position = 30;
    try {
      const localUrl = URL.createObjectURL(file);
      position = await detectFacePosition(localUrl);
      URL.revokeObjectURL(localUrl);
    } catch { position = 30; }
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDraft((p) => ({ ...p, image_url: file_url, image_position: position }));
    setUploading(false);
  };

  const save = async () => {
    await onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Input value={draft.year} onChange={(e) => setDraft((p) => ({ ...p, year: e.target.value }))} placeholder="Jahr" />
          <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Titel" className="col-span-2" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setDraft((p) => ({ ...p, event_type: t.value }))}
              className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
              style={{
                background: draft.event_type === t.value ? t.color : "white",
                borderColor: draft.event_type === t.value ? t.color : "#e5e7eb",
                color: draft.event_type === t.value ? "#1f2937" : "#6b7280",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Textarea
          value={draft.description || ""}
          onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
          placeholder="Beschreibung (optional)"
          className="h-20 resize-none text-sm"
        />
        <div className="flex items-center gap-3">
          {draft.image_url ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group">
              <img src={draft.image_url} className="w-full h-full object-cover" alt=""
                style={{ objectPosition: `50% ${draft.image_position ?? 30}%` }} />
              <button
                onClick={() => setDraft((p) => ({ ...p, image_url: "" }))}
                className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors flex-shrink-0">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px] text-stone-400 mt-0.5">Foto</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImg} disabled={uploading} />
            </label>
          )}
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" className="rounded-xl text-white" style={{ background: "#c9a96e", color: "#0f0e0c" }} onClick={save}>
              <Check className="w-4 h-4 mr-1" /> Speichern
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50 group">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: type.color + "44" }}
      >
        <Icon className="w-4 h-4" style={{ color: "#a07830" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: "#c9a96e" }}>{ev.year}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{getType(ev.event_type).label}</span>
        </div>
        <p className="font-medium text-gray-800 text-sm">{ev.title}</p>
        {ev.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</p>}
      </div>
      {ev.image_url && (
        <img src={ev.image_url} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" alt=""
          style={{ objectPosition: `50% ${ev.image_position ?? 30}%` }} />
      )}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => { setDraft(ev); setEditing(true); }} className="text-gray-400 hover:text-amber-700 p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(ev.id)} className="text-gray-400 hover:text-red-500 p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function TimelineEditor({ memorialId, timeline, setTimeline }) {
  const [newEvent, setNewEvent] = useState({ year: "", title: "", description: "", event_type: "meilenstein", image_url: "" });
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadImg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    let position = 30;
    try {
      const localUrl = URL.createObjectURL(file);
      position = await detectFacePosition(localUrl);
      URL.revokeObjectURL(localUrl);
    } catch { position = 30; }
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewEvent((p) => ({ ...p, image_url: file_url, image_position: position }));
    setUploading(false);
  };

  const add = async () => {
    if (!newEvent.year || !newEvent.title) return;
    const ev = await base44.entities.TimelineEvent.create({ ...newEvent, memorial_id: memorialId, sort_order: timeline.length });
    setTimeline((p) => [...p, ev].sort((a, b) => (a.year > b.year ? 1 : -1)));
    setNewEvent({ year: "", title: "", description: "", event_type: "meilenstein", image_url: "" });
    setAdding(false);
  };

  const remove = async (id) => {
    await base44.entities.TimelineEvent.delete(id);
    setTimeline((p) => p.filter((e) => e.id !== id));
  };

  const update = async (draft) => {
    const updated = await base44.entities.TimelineEvent.update(draft.id, draft);
    setTimeline((p) => p.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => (a.year > b.year ? 1 : -1)));
  };

  const sorted = [...timeline].sort((a, b) => (a.year > b.year ? 1 : -1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-500">{sorted.length} Ereignis{sorted.length !== 1 ? "se" : ""}</p>
        <Button size="sm" onClick={() => setAdding(true)} className="rounded-xl text-xs" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Ereignis hinzufügen
        </Button>
      </div>

      {adding && (
        <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Neues Ereignis</p>
          <div className="grid grid-cols-3 gap-2">
            <Input value={newEvent.year} onChange={(e) => setNewEvent((p) => ({ ...p, year: e.target.value }))} placeholder="Jahr z.B. 1985" />
            <Input value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} placeholder="Titel" className="col-span-2" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setNewEvent((p) => ({ ...p, event_type: t.value }))}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={{
                  background: newEvent.event_type === t.value ? t.color : "white",
                  borderColor: newEvent.event_type === t.value ? t.color : "#e5e7eb",
                  color: newEvent.event_type === t.value ? "#1f2937" : "#6b7280",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Textarea
            value={newEvent.description}
            onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
            placeholder="Beschreibung (optional)"
            className="h-20 resize-none text-sm"
          />
          <div className="flex items-center gap-3">
            {newEvent.image_url ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group">
                <img src={newEvent.image_url} className="w-full h-full object-cover" alt=""
                  style={{ objectPosition: `50% ${newEvent.image_position ?? 30}%` }} />
                <button
                  onClick={() => setNewEvent((p) => ({ ...p, image_url: "" }))}
                  className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors flex-shrink-0">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : <><Upload className="w-4 h-4 text-stone-400" /><span className="text-[10px] text-stone-400 mt-0.5">Foto</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={uploadImg} disabled={uploading} />
              </label>
            )}
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setAdding(false)}>Abbrechen</Button>
              <Button size="sm" disabled={!newEvent.year || !newEvent.title} onClick={add} className="rounded-xl" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                <Plus className="w-4 h-4 mr-1" /> Hinzufügen
              </Button>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Noch keine Ereignisse. Fügen Sie Geburt, Hochzeit oder Meilensteine hinzu.
        </div>
      )}

      {sorted.map((ev) => (
        <EventRow key={ev.id} ev={ev} onDelete={remove} onSave={update} />
      ))}
    </div>
  );
}