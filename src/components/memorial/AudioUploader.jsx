import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Mic, Music, Loader2 } from "lucide-react";

const TYPE_LABEL = { sprachnachricht: "Sprachnachricht", musik: "Musik" };

export default function AudioUploader({ memorialId }) {
  const [tracks, setTracks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", type: "sprachnachricht" });

  useEffect(() => {
    base44.entities.MemorialAudio.filter({ memorial_id: memorialId }).then(setTracks);
  }, [memorialId]);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file || !form.title) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const created = await base44.entities.MemorialAudio.create({
      memorial_id: memorialId,
      title: form.title,
      type: form.type,
      audio_url: file_url,
    });
    setTracks((p) => [...p, created]);
    setForm({ title: "", type: "sprachnachricht" });
    setUploading(false);
    e.target.value = "";
  };

  const remove = async (id) => {
    await base44.entities.MemorialAudio.delete(id);
    setTracks((p) => p.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-5 pt-2">
      <Label className="text-sm font-medium text-gray-700">Audio-Erinnerungen</Label>

      {tracks.length === 0 && (
        <p className="text-sm text-stone-400 italic">Noch keine Audioaufnahmen hochgeladen.</p>
      )}

      <div className="space-y-2">
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
              style={{ background: t.type === "sprachnachricht" ? "#fef3c7" : "#f0fdf4" }}>
              {t.type === "sprachnachricht"
                ? <Mic className="w-4 h-4" style={{ color: "#92400e" }} />
                : <Music className="w-4 h-4 text-green-700" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
              <p className="text-xs text-stone-400">{TYPE_LABEL[t.type]}</p>
            </div>
            <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Form */}
      <div className="border border-dashed border-stone-300 rounded-xl p-4 space-y-3 hover:border-amber-400 transition-colors">
        <p className="text-sm font-medium text-gray-600">Neue Aufnahme hochladen</p>
        <div>
          <Label className="text-xs">Titel / Beschreibung</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="z.B. Letzte Sprachnachricht, Lieblingslied…"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Typ</Label>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="sprachnachricht">Sprachnachricht</option>
            <option value="musik">Musikstück</option>
          </select>
        </div>
        <label className={`flex items-center gap-2 cursor-pointer ${!form.title ? "opacity-50 pointer-events-none" : ""}`}>
          <Button
            asChild
            disabled={uploading || !form.title}
            className="rounded-xl text-white pointer-events-none"
            style={{ background: "#b45309" }}
            size="sm"
          >
            <span>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              {uploading ? "Lädt hoch…" : "Datei wählen & hochladen"}
            </span>
          </Button>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={upload}
            disabled={uploading || !form.title}
          />
        </label>
        <p className="text-xs text-stone-400">Unterstützte Formate: MP3, M4A, WAV, OGG</p>
      </div>
    </div>
  );
}