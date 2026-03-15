import { useState } from "react";
import { Upload, Music, AlertCircle } from "lucide-react";

export default function AudioUploader({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    await onUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("audio/")) {
      handleUpload(file);
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
        style={{
          borderColor: dragActive ? "#c9a96e" : "#e8dfd0",
          background: dragActive ? "rgba(201,169,110,0.05)" : "#fafaf8",
        }}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => handleUpload(e.target.files?.[0])}
          style={{ display: "none" }}
          id="audio-input"
          disabled={isLoading}
        />
        <label htmlFor="audio-input" className="block cursor-pointer">
          <Music className="w-8 h-8 mx-auto mb-2" style={{ color: "#c9a96e" }} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Audiodatei hochladen
          </p>
          <p className="text-xs text-gray-500">
            Oder hierher ziehen · MP3, WAV, OGG
          </p>
        </label>
      </div>

      <div
        className="mt-4 rounded-lg p-4"
        style={{
          background: "#fafaf8",
          border: "1px solid #e8dfd0",
          borderRadius: 8,
        }}
      >
        <div className="flex gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#8a8278", marginTop: 2 }} />
          <p style={{ fontSize: 11, color: "#8a8278", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
            Bitte laden Sie nur Audiodateien hoch, für die Sie die erforderlichen Rechte besitzen — z. B. eigene Aufnahmen, Sprachnachrichten oder Musik, die Ihnen gehört. Für lizenzpflichtige Musik empfehlen wir die Spotify-Integration.
          </p>
        </div>
      </div>
    </div>
  );
}