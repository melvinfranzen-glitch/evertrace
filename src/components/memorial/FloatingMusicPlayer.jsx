import { useState, useRef, useEffect } from "react";
import { Music, ChevronDown, ChevronUp, X, Play, Pause } from "lucide-react";

export default function FloatingMusicPlayer({ spotifyUrl, name, curatedTracks = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const hasCuratedTracks = curatedTracks && curatedTracks.length > 0;
  const firstCuratedTrack = hasCuratedTracks ? curatedTracks[0] : null;

  // Prioritize Spotify, fall back to first curated track
  if (!spotifyUrl && !hasCuratedTracks) return null;
  if (dismissed) return null;

  const useCurated = !spotifyUrl && hasCuratedTracks;

  // Extract Spotify ID if Spotify URL exists
  let type, spotifyId, embedHeight;
  if (spotifyUrl && !useCurated) {
    const match = spotifyUrl.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    [, type, spotifyId] = match;
    embedHeight = type === "track" ? 152 : 352;
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
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
              <p className="text-white text-xs font-medium truncate">{useCurated ? "Trauermusik" : "Lieblingsmelodien"}</p>
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

      {/* Content area */}
       {expanded && useCurated && firstCuratedTrack && (
         <div className="p-4 border-t border-gray-700">
           <div className="flex items-center gap-3">
             <button
               onClick={handlePlayPause}
               className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
               style={{ background: "#c9a96e" }}
             >
               {playing ? (
                 <Pause className="w-4 h-4 text-white" fill="white" />
               ) : (
                 <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
               )}
             </button>
             <div className="flex-1 min-w-0">
               <p className="text-white text-sm font-medium truncate">{firstCuratedTrack.title}</p>
               <p className="text-gray-400 text-xs">{firstCuratedTrack.duration_hint}</p>
             </div>
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