import { useState } from "react";
import { Music, ChevronDown, ChevronUp, X } from "lucide-react";

export default function FloatingMusicPlayer({ spotifyUrl, name }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!spotifyUrl || dismissed) return null;

  // Extract Spotify ID and type (playlist, album, track)
  const match = spotifyUrl.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const [, type, id] = match;

  const embedHeight = type === "track" ? 152 : 352;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300"
      style={{ width: expanded ? 320 : "auto", background: "#1a1a1a" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        style={{ background: "#121212" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#1DB954" }}>
          <Music className="w-3.5 h-3.5 text-white" />
        </div>
        {expanded ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Lieblingsmelodien</p>
              <p className="text-gray-400 text-xs truncate">{name}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium whitespace-nowrap">Musik abspielen</p>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </>
        )}
        <button
          className="ml-1 p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          title="Schließen"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spotify embed */}
      {expanded && (
        <iframe
          src={`https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`}
          width="320"
          height={embedHeight}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Player"
          style={{ display: "block" }}
        />
      )}
    </div>
  );
}