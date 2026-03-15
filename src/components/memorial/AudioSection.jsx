import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic, Music, Volume2, Mail, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  try { return format(new Date(d), "d. MMMM yyyy", { locale: de }); }
  catch { return d; }
}

function daysUntil(d) {
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Locked letter card
function LockedLetter({ track }) {
  const days = daysUntil(track.release_date);
  return (
    <div className="relative flex items-center gap-4 p-5 rounded-2xl border overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e3a5f08, #1e3a5f12)", borderColor: "#bfdbfe" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #1d4ed8 0, #1d4ed8 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }} />
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#dbeafe" }}>
        <Lock className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            Digitaler Brief
          </span>
        </div>
        <p className="font-medium text-gray-700 text-sm">{track.title}</p>
        {track.letter_from && <p className="text-xs text-gray-500 mt-0.5">Von: {track.letter_from}</p>}
        <p className="text-xs mt-1.5" style={{ color: "#1d4ed8" }}>
          Freischaltung am {fmtDate(track.release_date)} · noch {days} {days === 1 ? "Tag" : "Tage"}
        </p>
      </div>
    </div>
  );
}

// Unlocked letter — shows intro card then audio player
function UnlockedLetter({ track }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#86efac" }}>
        <div className="flex items-start gap-4 p-5"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 flex-shrink-0"
            style={{ background: "#bbf7d0" }}>
            <Mail className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#bbf7d0", color: "#14532d" }}>
                Digitaler Brief · Freigeschaltet
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{track.title}</p>
            {track.letter_from && <p className="text-xs text-gray-600 mt-0.5">Von: {track.letter_from}</p>}
            {track.letter_message && (
              <p className="text-sm italic text-gray-600 mt-2 leading-relaxed border-l-2 pl-3" style={{ borderColor: "#86efac" }}>
                „{track.letter_message}"
              </p>
            )}
            <button
              onClick={() => setOpen(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "#16a34a" }}
            >
              <Unlock className="w-3.5 h-3.5" /> Brief abspielen
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#86efac" }}>
      <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium"
        style={{ background: "#dcfce7", color: "#14532d" }}>
        <Mail className="w-3.5 h-3.5" /> {track.title} {track.letter_from && `· Von ${track.letter_from}`}
      </div>
      <AudioTrack track={track} />
    </div>
  );
}

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

export default function AudioSection({ tracks, curatedTracks = [] }) {
  if (!tracks || tracks.length === 0) return null;

  const regularTracks = tracks.filter((t) => !t.is_letter);
  const letters = tracks.filter((t) => t.is_letter);
  const unlockedLetters = letters.filter((t) => new Date() >= new Date(t.release_date));
  const lockedLetters = letters.filter((t) => new Date() < new Date(t.release_date));

  return (
    <section className="py-20 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Stimmen & Klänge</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Audioerinnerungen
          </h2>
          <p className="text-gray-500 mt-3 text-base max-w-sm mx-auto">
            Sprachnachrichten und Musik, die von diesem Menschen stammen oder an ihn erinnern.
          </p>
        </div>

        {/* Freigeschaltete Briefe */}
        {unlockedLetters.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-green-700 flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5" /> Freigeschaltete Briefe
            </p>
            {unlockedLetters.map((t) => <UnlockedLetter key={t.id} track={t} />)}
          </div>
        )}

        {/* Reguläre Tracks */}
        {regularTracks.length > 0 && (
          <div className="space-y-3 mb-6">
            {regularTracks.map((t) => <AudioTrack key={t.id} track={t} />)}
          </div>
        )}

        {/* Gesperrte Briefe */}
        {lockedLetters.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Digitale Briefe · Noch versiegelt
            </p>
            {lockedLetters.map((t) => <LockedLetter key={t.id} track={t} />)}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-stone-400">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Bitte Kopfhörer für das beste Erlebnis verwenden.</span>
        </div>
      </div>
    </section>
  );
}