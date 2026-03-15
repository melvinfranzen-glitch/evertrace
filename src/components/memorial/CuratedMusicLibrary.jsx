import { useState } from "react";
import { Play, Pause, Check } from "lucide-react";

const CURATED_TRACKS = [
  { id: "ct1", title: "Stille Momente", mood: "Ruhig & besinnlich", duration_hint: "3:24", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct2", title: "In Erinnerung", mood: "Warm & emotional", duration_hint: "4:12", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct3", title: "Abschied", mood: "Klassisch & würdevoll", duration_hint: "2:58", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct4", title: "Sanfte Wellen", mood: "Ruhig & besinnlich", duration_hint: "5:01", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct5", title: "Für immer", mood: "Warm & emotional", duration_hint: "3:47", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct6", title: "Das Licht bleibt", mood: "Klassisch & würdevoll", duration_hint: "4:33", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct7", title: "Frieden", mood: "Ruhig & besinnlich", duration_hint: "3:15", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct8", title: "Erinnerungen", mood: "Warm & emotional", duration_hint: "4:08", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct9", title: "Letzte Umarmung", mood: "Warm & emotional", duration_hint: "3:52", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct10", title: "Der Morgen danach", mood: "Klassisch & würdevoll", duration_hint: "5:20", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct11", title: "Weite", mood: "Ruhig & besinnlich", duration_hint: "6:04", audio_url: "REPLACE_WITH_PIXABAY_URL" },
  { id: "ct12", title: "Geborgen", mood: "Warm & emotional", duration_hint: "3:38", audio_url: "REPLACE_WITH_PIXABAY_URL" },
];

const MOOD_CATEGORIES = [
  { id: "all", label: "Alle" },
  { id: "calm", label: "Ruhig & besinnlich" },
  { id: "classical", label: "Klassisch & würdevoll" },
  { id: "warm", label: "Warm & emotional" },
];

export default function CuratedMusicLibrary({ selectedIds = [], onSelectionChange }) {
  const [playingId, setPlayingId] = useState(null);
  const [activeMoodFilter, setActiveMoodFilter] = useState("all");
  const audioRef = React.useRef(null);

  const filteredTracks = activeMoodFilter === "all"
    ? CURATED_TRACKS
    : CURATED_TRACKS.filter(t => t.mood === MOOD_CATEGORIES.find(m => m.id === activeMoodFilter)?.label);

  const handleToggleSelect = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handlePlayTrack = (track) => {
    if (playingId === track.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
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
                  className="flex-shrink-0 ml-2 w-6 h-6 flex items-center justify-center"
                  style={{ color: "#c9a96e" }}
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
                {track.duration_hint}
              </p>
            </div>
          );
        })}
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {hasUnsavedChanges && (
        <div style={{ color: "#b45309", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
          Änderungen nicht vergessen zu speichern.
        </div>
      )}
    </div>
  );
}