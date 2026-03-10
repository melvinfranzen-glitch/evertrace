import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Mic, Music, Loader2, Mail, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TYPE_LABEL = { sprachnachricht: "Sprachnachricht", musik: "Musik" };
const OCCASION_LABEL = { jahrestag: "Jahrestag", geburtstag: "Geburtstag", weihnachten: "Weihnachten", individuell: "Individuell" };

function isUnlocked(track) {
  if (!track.is_letter || !track.release_date) return true;
  return new Date() >= new Date(track.release_date);
}

function fmtDate(d) {
  try { return format(new Date(d), "d. MMM yyyy", { locale: de }); }
  catch { return d; }
}

export default function AudioUploader({ memorialId }) {
  const [tracks, setTracks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("audio"); // "audio" | "letter"
  const [form, setForm] = useState({ title: "", type: "sprachnachricht", is_letter: false, release_date: "", release_occasion: "jahrestag", letter_from: "", letter_message: "" });

  useEffect(() => {
    base44.entities.MemorialAudio.filter({ memorial_id: memorialId }).then(setTracks);
  }, [memorialId]);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file || !form.title) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const payload = {
      memorial_id: memorialId,
      title: form.title,
      type: form.type,
      audio_url: file_url,
    };
    if (mode === "letter") {
      payload.is_letter = true;
      payload.release_date = form.release_date;
      payload.release_occasion = form.release_occasion;
      payload.letter_from = form.letter_from;
      payload.letter_message = form.letter_message;
    }
    const created = await base44.entities.MemorialAudio.create(payload);
    setTracks((p) => [...p, created]);
    setForm({ title: "", type: "sprachnachricht", is_letter: false, release_date: "", release_occasion: "jahrestag", letter_from: "", letter_message: "" });
    setUploading(false);
    e.target.value = "";
  };

  const remove = async (id) => {
    await base44.entities.MemorialAudio.delete(id);
    setTracks((p) => p.filter((t) => t.id !== id));
  };

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5 pt-2">
      <Label className="text-sm font-medium text-gray-700">Audio-Erinnerungen & Digitale Briefe</Label>

      {tracks.length === 0 && (
        <p className="text-sm text-stone-400 italic">Noch keine Aufnahmen hochgeladen.</p>
      )}

      <div className="space-y-2">
        {tracks.map((t) => {
          const unlocked = isUnlocked(t);
          return (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: t.is_letter ? "#eff6ff" : t.type === "sprachnachricht" ? "#fef3c7" : "#f0fdf4" }}>
                {t.is_letter
                  ? (unlocked ? <Mail className="w-4 h-4 text-blue-600" /> : <Lock className="w-4 h-4 text-blue-400" />)
                  : t.type === "sprachnachricht"
                    ? <Mic className="w-4 h-4" style={{ color: "#92400e" }} />
                    : <Music className="w-4 h-4 text-green-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                <p className="text-xs text-stone-400">
                  {t.is_letter
                    ? (unlocked
                        ? `Digitaler Brief · Freigeschaltet seit ${fmtDate(t.release_date)}`
                        : `Digitaler Brief · Freischaltung: ${fmtDate(t.release_date)}`)
                    : TYPE_LABEL[t.type]}
                </p>
              </div>
              <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit">
        <button
          onClick={() => setMode("audio")}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: mode === "audio" ? "white" : "transparent", color: mode === "audio" ? "#b45309" : "#6b7280", boxShadow: mode === "audio" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          <Mic className="w-3.5 h-3.5 inline mr-1.5" />Aufnahme
        </button>
        <button
          onClick={() => setMode("letter")}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: mode === "letter" ? "white" : "transparent", color: mode === "letter" ? "#1d4ed8" : "#6b7280", boxShadow: mode === "letter" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          <Mail className="w-3.5 h-3.5 inline mr-1.5" />Digitaler Brief
        </button>
      </div>

      {/* Upload Form */}
      <div className="border border-dashed rounded-xl p-4 space-y-3 transition-colors"
        style={{ borderColor: mode === "letter" ? "#93c5fd" : "#d6d3d1" }}>

        {mode === "letter" && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-blue-700 mb-1"
            style={{ background: "#eff6ff" }}>
            <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Ein Digitaler Brief wird erst ab einem bestimmten Datum auf der Gedenkseite sichtbar — ideal für Jahrestage oder Geburtstage.</span>
          </div>
        )}

        <div>
          <Label className="text-xs">Titel / Beschreibung</Label>
          <Input value={form.title} onChange={(e) => setF("title", e.target.value)}
            placeholder={mode === "letter" ? "z.B. Zum ersten Jahrestag…" : "z.B. Lieblingslied, Sprachnachricht…"}
            className="mt-1" />
        </div>

        {mode === "audio" && (
          <div>
            <Label className="text-xs">Typ</Label>
            <select value={form.type} onChange={(e) => setF("type", e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="sprachnachricht">Sprachnachricht</option>
              <option value="musik">Musikstück</option>
            </select>
          </div>
        )}

        {mode === "letter" && (
          <>
            <div>
              <Label className="text-xs">Absender (Von)</Label>
              <Input value={form.letter_from} onChange={(e) => setF("letter_from", e.target.value)}
                placeholder="z.B. Mama, Euer Vater…" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Begleittext (optional)</Label>
              <textarea value={form.letter_message} onChange={(e) => setF("letter_message", e.target.value)}
                placeholder="Eine kurze Botschaft, die vor dem Abspielen erscheint…"
                className="mt-1 w-full h-16 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Anlass</Label>
                <select value={form.release_occasion} onChange={(e) => setF("release_occasion", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="jahrestag">Jahrestag</option>
                  <option value="geburtstag">Geburtstag</option>
                  <option value="weihnachten">Weihnachten</option>
                  <option value="individuell">Individuell</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Freischaltdatum *</Label>
                <Input type="date" value={form.release_date} onChange={(e) => setF("release_date", e.target.value)}
                  className="mt-1" min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
          </>
        )}

        <label className={`flex items-center gap-2 cursor-pointer ${!form.title || (mode === "letter" && !form.release_date) ? "opacity-50 pointer-events-none" : ""}`}>
          <Button asChild disabled={uploading || !form.title || (mode === "letter" && !form.release_date)}
            className="rounded-xl text-white pointer-events-none"
            style={{ background: mode === "letter" ? "#1d4ed8" : "#b45309" }}
            size="sm">
            <span>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : mode === "letter" ? <Mail className="w-4 h-4 mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              {uploading ? "Lädt hoch…" : mode === "letter" ? "Brief hochladen" : "Datei wählen & hochladen"}
            </span>
          </Button>
          <input type="file" accept="audio/*" className="hidden" onChange={upload}
            disabled={uploading || !form.title || (mode === "letter" && !form.release_date)} />
        </label>
        <p className="text-xs text-stone-400">Unterstützte Formate: MP3, M4A, WAV, OGG</p>
      </div>
    </div>
  );
}