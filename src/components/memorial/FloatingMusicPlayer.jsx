import { useState, useRef, useEffect } from "react";
import { Music, ChevronDown, ChevronUp, X, Play, Pause } from "lucide-react";

export default function FloatingMusicPlayer({ spotifyUrl, name, curatedTracks = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const hasCuratedTracks = curatedTracks && curatedTracks.length > 0;
  const firstCuratedTrack = hasCuratedTracks ? curatedTracks[0] : null;

  if (!spotifyUrl && !hasCuratedTracks) return null;
  if (dismissed) return null;

  const useCurated = !spotifyUrl && hasCuratedTracks;

  let type, spotifyId, embedHeight;
  if (spotifyUrl && !useCurated) {
    const match = spotifyUrl.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    [, type, spotifyId] = match;
    embedHeight = type === "track" ? 152 : 352;
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300"
      style={{ width: expanded ? 320 : "auto", background: "rgba(47,45,42,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(216,195,165,0.15)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        style={{ background: "rgba(35,30,26,0.6)" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#B07B34" }}>
          <Music className="w-3.5 h-3.5" style={{ color: "#F7F3ED" }} />
        </div>
        {expanded ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal truncate" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#D8C3A5" }}>{useCurated ? "Trauermusik" : "Lieblingsmelodien"}</p>
              <p className="text-xs truncate" style={{ color: "rgba(216,195,165,0.5)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{name}</p>
            </div>
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(216,195,165,0.5)" }} />
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal whitespace-nowrap" style={{ fontFamily: "'Lato', sans-serif", color: "#D8C3A5" }}>Musik abspielen</p>
            </div>
            <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(216,195,165,0.5)" }} />
          </>
        )}
        <button
          className="ml-1 p-1 rounded-full transition-colors"
          style={{ color: "rgba(216,195,165,0.5)" }}
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          title="Schließen"
          onMouseEnter={e => e.currentTarget.style.color = "#D8C3A5"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(216,195,165,0.5)"}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Curated audio */}
      {expanded && useCurated && firstCuratedTrack && (
        <div className="p-4" style={{ borderTop: "1px solid rgba(216,195,165,0.1)" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: "#B07B34" }}
            >
              {playing ? (
                <Pause className="w-4 h-4" style={{ color: "#F7F3ED" }} fill="#F7F3ED" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" style={{ color: "#F7F3ED" }} fill="#F7F3ED" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#D8C3A5" }}>{firstCuratedTrack.title}</p>
              <p className="text-xs" style={{ color: "rgba(216,195,165,0.5)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{firstCuratedTrack.duration_hint}</p>
            </div>
          </div>
          {/* Progress bar placeholder */}
          <div className="mt-3 h-0.5 rounded-full" style={{ background: "rgba(216,195,165,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: "30%", background: "#B07B34" }} />
          </div>
          <audio ref={audioRef} src={firstCuratedTrack.audio_url} />
        </div>
      )}

      {/* Spotify embed */}
      {expanded && !useCurated && spotifyUrl && (
        <iframe
          src={`https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0`}
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