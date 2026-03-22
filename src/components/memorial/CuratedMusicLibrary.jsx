import { useState, useRef } from "react";
import { Play, Pause, Check } from "lucide-react";
import { CURATED_TRACKS } from "./curatedTracksData";

const MOOD_CATEGORIES = [
  { id: "all", label: "Alle" },
  { id: "calm", label: "Ruhig & besinnlich" },
  { id: "classical", label: "Klassisch & würdevoll" },
  { id: "warm", label: "Warm & emotional" },
];

export default function CuratedMusicLibrary({ selectedIds = [], onSelectionChange }) {
  const [playingId, setPlayingId] = useState(null);
  const [activeMoodFilter, setActiveMoodFilter] = useState("all");
  const audioRef = useRef(null);

  const filteredTracks = activeMoodFilter === "all"
    ? CURATED_TRACKS
    : CURATED_TRACKS.filter(t => t.mood === MOOD_CATEGORIES.find(m => m.id === activeMoodFilter)?.label);

  const handleToggleSelect = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const isPlaceholder = (url) => !url || url.startsWith("PIXABAY_URL");

  const handlePlayTrack = (track) => {
    if (isPlaceholder(track.audio_url)) return;
    if (playingId === track.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play().catch(() => setPlayingId(null));
        setPlayingId(track.id);
      }
    }
  };

  const hasUnsavedChanges = false; // This would be tracked by parent

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {MOOD_CATEGORIES.map(mood => (
          <button
            key={mood.id}
            onClick={() => setActiveMoodFilter(mood.id)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeMoodFilter === mood.id ? "rgba(201,169,110,0.15)" : "white",
              border: `1px solid ${activeMoodFilter === mood.id ? "#c9a96e" : "#e5e7eb"}`,
              color: activeMoodFilter === mood.id ? "#c9a96e" : "#6b7280",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            {mood.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {filteredTracks.map(track => {
          const isSelected = selectedIds.includes(track.id);
          return (
            <div
              key={track.id}
              onClick={() => handleToggleSelect(track.id)}
              className="relative p-4 rounded-[10px] cursor-pointer transition-all"
              style={{
                background: isSelected ? "rgba(201,169,110,0.05)" : "white",
                border: `1px solid ${isSelected ? "#c9a96e" : "#e5e7eb"}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2c2419", fontWeight: 500 }}>
                    {track.title}
                  </p>
                  <span className="inline-block text-xs px-2 py-1 rounded-full mt-1" style={{ background: "#f3f4f6", color: "#8a8278" }}>
                    {track.mood}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                  disabled={isPlaceholder(track.audio_url)}
                  className="flex-shrink-0 ml-2 w-6 h-6 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "#c9a96e" }}
                  title={isPlaceholder(track.audio_url) ? "Bald verfügbar" : undefined}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : playingId === track.id ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 ml-0.5" />
                  )}
                </button>
              </div>
              <p className="text-xs" style={{ color: "#8a8278" }}>
                {isPlaceholder(track.audio_url) ? "Bald verfügbar" : track.duration_hint}
              </p>
            </div>
          );
        })}
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} onError={() => setPlayingId(null)} />

      {hasUnsavedChanges && (
        <div style={{ color: "#c9a96e", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
          Änderungen nicht vergessen zu speichern.
        </div>
      )}
    </div>
  );
}