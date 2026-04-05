import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Mic, Play, Pause, Trash2, Loader2, Music, MicOff, AlertCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AudioUploader({ memorialId }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("sprachnachricht");
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingUrl, setPendingUrl] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunks = useRef([]);
  const timerRef = useRef(null);

  // Load existing tracks
  useEffect(() => {
    if (!memorialId) return;
    base44.entities.MemorialAudio.filter({ memorial_id: memorialId }, "created_date")
      .then(setTracks)
      .finally(() => setLoading(false));
  }, [memorialId]);

  // ─── File Upload ────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate: check MIME type or extension
    const isAudioMime = file.type.startsWith("audio/");
    const isAudioExt = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
    
    if (!isAudioMime && !isAudioExt) {
      alert("Bitte wählen Sie eine Audiodatei (MP3, WAV, OGG, M4A, AAC, FLAC).");
      return;
    }
    
    if (file.size > 25 * 1024 * 1024) {
      alert("Die Datei ist zu groß. Maximal 25 MB.");
      return;
    }

    // Check duration
    checkDuration(file).then((duration) => {
      if (duration > 300) {
        alert("Die Audiodatei darf maximal 5 Minuten lang sein. Für längere Musik empfehlen wir die Spotify-Integration.");
        return;
      }
      setPendingFile(file);
      setPendingUrl(URL.createObjectURL(file));
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(name);
      setNewType("sprachnachricht");
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    const isAudioMime = file?.type.startsWith("audio/");
    const isAudioExt = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file?.name || "");
    if (file && (isAudioMime || isAudioExt)) {
      setPendingFile(file);
      setPendingUrl(URL.createObjectURL(file));
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(name);
    }
  };

  // ─── Microphone Recording ──────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      mediaRecorderRef.current = mediaRecorder;
      recordingChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunks.current, { type: mediaRecorder.mimeType });
        const file = new File([blob], `aufnahme-${Date.now()}.webm`, { type: mediaRecorder.mimeType });
        setPendingFile(file);
        setPendingUrl(URL.createObjectURL(blob));
        setNewTitle("Sprachnachricht");
        setNewType("sprachnachricht");
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

      // Auto-stop nach 5 Minuten
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") stopRecording();
      }, 5 * 60 * 1000);
    } catch (err) {
      alert("Mikrofon-Zugriff wurde nicht erlaubt. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(timerRef.current);
  };

  // ─── Save Track ─────────────────────────────────────────

  const saveTrack = async () => {
    if (!pendingFile || !newTitle.trim()) return;
    if (tracks.length >= 10) {
      alert("Sie können maximal 10 Aufnahmen pro Gedenkseite hochladen.");
      return;
    }
    setUploading(true);

    try {
      // Upload file to Base44
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pendingFile });

      // Create MemorialAudio entity
      const track = await base44.entities.MemorialAudio.create({
        memorial_id: memorialId,
        title: newTitle.trim(),
        type: newType,
        audio_url: file_url,
        is_letter: false,
      });

      setTracks(prev => [...prev, track]);
      setPendingFile(null);
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      setPendingUrl(null);
      setNewTitle("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Beim Hochladen ist ein Fehler aufgetreten: " + (err?.message || "Unbekannter Fehler"));
    }
    setUploading(false);
  };

  const cancelPending = () => {
    setPendingFile(null);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(null);
    setNewTitle("");
  };

  // ─── Delete Track ───────────────────────────────────────

  const deleteTrack = async (id) => {
    if (!window.confirm("Möchten Sie diese Aufnahme wirklich löschen?")) return;
    await base44.entities.MemorialAudio.delete(id);
    setTracks(prev => prev.filter(t => t.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  // ─── Playback ───────────────────────────────────────────

  const togglePlay = (track) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
        setPlayingId(track.id);
      }
    }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Check audio duration
  const checkDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  };

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Pending file / recording result → Title + Save */}
      {pendingFile && (
        <div className="rounded-xl border-2 p-5 space-y-4" style={{ borderColor: "#c9a96e", background: "rgba(201,169,110,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.15)" }}>
              {newType === "sprachnachricht" ? <Mic className="w-4 h-4" style={{ color: "#c9a96e" }} /> : <Music className="w-4 h-4" style={{ color: "#c9a96e" }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
              <p className="text-xs text-gray-400">{(pendingFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            {/* Preview play */}
            {pendingUrl && (
              <button onClick={() => { 
                if (audioRef.current) { audioRef.current.src = pendingUrl; audioRef.current.play(); }
              }} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                Anhören
              </button>
            )}
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: "#8a8278" }}>Titel der Aufnahme</label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="z.B. Sprachnachricht von Opa" className="rounded-xl" />
          </div>

          <div>
            <label className="text-xs block mb-1.5" style={{ color: "#8a8278" }}>Art</label>
            <div className="flex gap-2">
              {[
                { id: "sprachnachricht", label: "Sprachnachricht", icon: Mic },
                { id: "musik", label: "Musik / Lied", icon: Music },
              ].map(t => (
                <button key={t.id} onClick={() => setNewType(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: newType === t.id ? "rgba(201,169,110,0.12)" : "white",
                    border: `1px solid ${newType === t.id ? "#c9a96e" : "#e5e7eb"}`,
                    color: newType === t.id ? "#c9a96e" : "#6b7280",
                  }}>
                  <t.icon className="w-3 h-3" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={cancelPending} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              Abbrechen
            </button>
            <button onClick={saveTrack} disabled={uploading || !newTitle.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {uploading ? "Wird hochgeladen…" : "Aufnahme speichern"}
            </button>
          </div>
        </div>
      )}

      {/* Upload + Record Buttons (nur wenn kein pending file) */}
      {!pendingFile && (
        <div className="space-y-3">
          {/* Recording */}
          {recording ? (
            <div className="rounded-xl border-2 border-red-300 p-5 text-center" style={{ background: "rgba(239,68,68,0.04)" }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-600">Aufnahme läuft · {fmtTime(recordingTime)}</span>
              </div>
              <button onClick={stopRecording}
                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white">
                <MicOff className="w-4 h-4 inline mr-1.5" /> Aufnahme beenden
              </button>
              <p className="text-xs text-gray-400 mt-2">Maximal 5 Minuten</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer hover:border-amber-400"
                style={{ borderColor: "#e8dfd0", background: "#fafaf8" }}>
                <label className="cursor-pointer block">
                  <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: "#c9a96e" }} />
                  <p className="text-sm font-medium text-gray-700 mb-0.5">Datei hochladen</p>
                  <p className="text-xs text-gray-400">MP3, WAV, OGG · max. 25 MB</p>
                  <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>

              {/* Microphone Record */}
              <button onClick={startRecording}
                className="border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer hover:border-amber-400"
                style={{ borderColor: "#e8dfd0", background: "#fafaf8" }}>
                <Mic className="w-7 h-7 mx-auto mb-2" style={{ color: "#c9a96e" }} />
                <p className="text-sm font-medium text-gray-700 mb-0.5">Aufnehmen</p>
                <p className="text-xs text-gray-400">Sprachnachricht direkt aufnehmen</p>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing Tracks List */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Aufnahmen werden geladen…
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest" style={{ color: "#c9a96e", letterSpacing: "0.15em" }}>
            Hochgeladene Aufnahmen ({tracks.length})
          </p>
          {tracks.map(track => (
            <div key={track.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white">
              <button onClick={() => togglePlay(track)}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: playingId === track.id ? "#a07830" : "#c9a96e" }}>
                {playingId === track.id
                  ? <Pause className="w-3.5 h-3.5 text-white" fill="white" />
                  : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{track.title}</p>
                <p className="text-xs text-gray-400">
                  {track.type === "sprachnachricht" ? "Sprachnachricht" : "Musik"}
                  {track.duration_hint && ` · ${track.duration_hint}`}
                </p>
              </div>
              <button onClick={() => deleteTrack(track.id)}
                className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : !pendingFile ? (
        <div className="text-center py-6 text-gray-400">
          <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Aufnahmen</p>
          <p className="text-xs mt-1">Laden Sie eine Audiodatei hoch oder nehmen Sie eine Sprachnachricht auf.</p>
        </div>
      ) : null}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Legal hint */}
      <div className="rounded-lg p-3 flex gap-2.5" style={{ background: "#fafaf8", border: "1px solid #e8dfd0" }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8a8278" }} />
        <p style={{ fontSize: 11, color: "#8a8278", lineHeight: 1.5 }}>
          Bitte laden Sie nur Dateien hoch, für die Sie die Rechte besitzen — z.B. eigene Sprachnachrichten, persönliche Aufnahmen oder Musik ohne Urheberrechtsschutz.
        </p>
      </div>
    </div>
  );
}