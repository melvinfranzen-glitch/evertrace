import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic, Music, Volume2 } from "lucide-react";

function AudioTrack({ track }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const toggle = () => {
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
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isVoice = track.type === "sprachnachricht";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <audio ref={audioRef} src={track.audio_url} preload="metadata" />

      {/* Play Button */}
      <button
        onClick={toggle}
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
        style={{ background: playing ? "#92400e" : "#b45309" }}
      >
        {playing
          ? <Pause className="w-4 h-4 text-white" fill="white" />
          : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
      </button>

      {/* Info + Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: isVoice ? "#fef3c7" : "#f0fdf4", color: isVoice ? "#92400e" : "#166534" }}>
            {isVoice ? <Mic className="w-3 h-3" /> : <Music className="w-3 h-3" />}
            {isVoice ? "Sprachnachricht" : "Musik"}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate">{track.title}</span>
        </div>

        {/* Waveform / progress bar */}
        <div
          className="relative h-2 bg-stone-200 rounded-full cursor-pointer overflow-hidden"
          onClick={seek}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #b45309, #c9a84c)" }}
          />
        </div>

        <div className="flex justify-between mt-1 text-xs text-stone-400">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration) === "0:00" && track.duration_hint ? track.duration_hint : fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AudioSection({ tracks }) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="py-20 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Stimmen & Klänge</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Audioerinnerungen
          </h2>
          <p className="text-gray-500 mt-3 text-sm max-w-sm mx-auto">
            Sprachnachrichten und Musik, die von diesem Menschen stammen oder an ihn erinnern.
          </p>
        </div>

        <div className="space-y-3">
          {tracks.map((t) => <AudioTrack key={t.id} track={t} />)}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-stone-400">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Bitte Kopfhörer für das beste Erlebnis verwenden.</span>
        </div>
      </div>
    </section>
  );
}