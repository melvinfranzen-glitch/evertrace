import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CANDLE_TYPES = [
  { id: "classic", label: "Klassisch", color: "#f0e8d8", flame: "#f59e0b" },
  { id: "memorial", label: "Gedenken", color: "#d4a96e", flame: "#ef4444" },
  { id: "peace", label: "Frieden", color: "#e8e8f0", flame: "#818cf8" },
  { id: "hope", label: "Hoffnung", color: "#d8f0d8", flame: "#4ade80" },
];

function CandleSVG({ name, message, type = "classic" }) {
  const t = CANDLE_TYPES.find(ct => ct.id === type) || CANDLE_TYPES[0];
  return (
    <div className="flex flex-col items-center cursor-default" title={message || name}>
      <svg width="28" height="52" viewBox="0 0 32 56" className="candle-flame">
        <ellipse cx="16" cy="8" rx="5" ry="7" fill={t.flame} opacity="0.9" />
        <ellipse cx="16" cy="10" rx="3" ry="5" fill={t.flame} opacity="0.5" />
        <ellipse cx="16" cy="6" rx="2" ry="4" fill="#fff" opacity="0.4" />
        <line x1="16" y1="14" x2="16" y2="18" stroke="#374151" strokeWidth="1.5" />
        <rect x="11" y="18" width="10" height="34" rx="2" fill={t.color} />
        <rect x="11" y="18" width="10" height="4" rx="2" fill="#e7e0d4" />
        <ellipse cx="16" cy="18" rx="12" ry="5" fill={t.flame} opacity="0.12" />
      </svg>
      <p className="text-xs text-stone-500 mt-1.5 max-w-[64px] text-center leading-tight truncate">{name}</p>
    </div>
  );
}

export default function VirtualCandleSection({ memorialId, candles, onNewCandle }) {
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [candleType, setCandleType] = useState("classic");

  const light = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    const candle = await base44.entities.Candle.create({
      memorial_id: memorialId,
      lighter_name: form.name,
      message: form.message,
      candle_type: candleType,
    });
    await base44.entities.Memorial.update(memorialId, { candle_count: (candles.length || 0) + 1 });
    onNewCandle(candle);
    setDone(true);
    setLoading(false);
    setShowing(false);
    setForm({ name: "", message: "" });
    setTimeout(() => setDone(false), 5000);
  };

  return (
    <section className="py-24 px-6" style={{ borderRadius: 20, background: "linear-gradient(160deg, #2A2218 0%, #1E1A14 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 35% at 50% 90%, rgba(176,123,52,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div className="max-w-4xl mx-auto text-center">

        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-amber-700/40" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z" fill="#c9a84c" opacity="0.6"/>
            <circle cx="12" cy="12" r="2.5" fill="#c9a84c"/>
          </svg>
          <div className="h-px w-10 bg-amber-700/40" />
        </div>

        <p className="uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 10, letterSpacing: "0.2em", color: "#D8C3A5", opacity: 0.5 }}>Virtuelle Kerzen</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 28, color: "#F7F3ED", marginBottom: 12 }}>
          Ein Licht entzünden
        </h2>
        <p className="font-light mb-3 text-base" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "rgba(216,195,165,0.55)" }}>
          {candles.length > 0
            ? `${candles.length} ${candles.length === 1 ? "Kerze brennt" : "Kerzen brennen"} zum Gedenken`
            : "Entzünden Sie eine Kerze — als stilles Zeichen Ihrer Verbundenheit."}
        </p>
        {candles.length === 0 && (
          <p className="text-sm italic mb-8" style={{ color: "#6b5a44", fontFamily: "'Cormorant Garamond', serif" }}>
            „Ein kleines Licht vertreibt viel Dunkel."
          </p>
        )}

        {/* Candles grid */}
        {candles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 mb-10 py-4">
            {candles.slice(0, 24).map((c) => (
              <CandleSVG key={c.id} name={c.lighter_name} message={c.message} type={c.candle_type} />
            ))}
          </div>
        )}

        {done && (
          <div
            className="mb-8 px-6 py-3 rounded-full inline-block text-sm"
            style={{ background: "rgba(176,123,52,0.12)", color: "#B07B34", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Ihre Kerze brennt nun — herzlichen Dank.
          </div>
        )}

        {!showing ? (
          <Button
            onClick={() => setShowing(true)}
            className="rounded-full px-8 py-5 text-sm tracking-wide"
            style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
          >
            Kerze entzünden
          </Button>
        ) : (
          <div className="max-w-sm mx-auto space-y-3 text-left mt-6">
            {/* Kerzentyp-Auswahl */}
            <div className="flex justify-center gap-3 mb-1">
              {CANDLE_TYPES.map(t => (
                <button key={t.id} onClick={() => setCandleType(t.id)} type="button"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    border: candleType === t.id ? `2px solid ${t.flame}` : "2px solid transparent",
                    background: candleType === t.id ? `${t.flame}18` : "transparent"
                  }}>
                  <svg width="16" height="28" viewBox="0 0 32 56">
                    <ellipse cx="16" cy="8" rx="5" ry="7" fill={t.flame} opacity="0.9" />
                    <ellipse cx="16" cy="10" rx="3" ry="5" fill={t.flame} opacity="0.5" />
                    <rect x="11" y="18" width="10" height="34" rx="2" fill={t.color} />
                  </svg>
                  <span className="text-xs" style={{ color: "#8a8278" }}>{t.label}</span>
                </button>
              ))}
            </div>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ihr Name *"
              className="rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
            />
            <Textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Eine persönliche Nachricht (optional)"
              className="rounded-xl h-20 resize-none"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
            />
            <div className="flex gap-2">
              <Button
                onClick={light}
                disabled={!form.name.trim() || loading}
                className="flex-1 rounded-xl"
                style={{ background: "#B07B34", color: "#F7F3ED" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kerze entzünden"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowing(false)}
                className="rounded-xl bg-transparent"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#a09070" }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}