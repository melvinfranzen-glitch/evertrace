import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function CandleSVG({ name, message }) {
  return (
    <div className="flex flex-col items-center cursor-default" title={message || name}>
      <svg width="28" height="52" viewBox="0 0 32 56" className="candle-flame">
        <ellipse cx="16" cy="8" rx="5" ry="7" fill="#f59e0b" opacity="0.9" />
        <ellipse cx="16" cy="10" rx="3" ry="5" fill="#fcd34d" opacity="0.8" />
        <ellipse cx="16" cy="6" rx="2" ry="4" fill="#fef3c7" opacity="0.7" />
        <line x1="16" y1="14" x2="16" y2="18" stroke="#374151" strokeWidth="1.5" />
        <rect x="11" y="18" width="10" height="34" rx="2" fill="#f5f0e8" />
        <rect x="11" y="18" width="10" height="4" rx="2" fill="#e7e0d4" />
        <ellipse cx="16" cy="18" rx="12" ry="5" fill="#fbbf24" opacity="0.12" />
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

  const light = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    const candle = await base44.entities.Candle.create({
      memorial_id: memorialId,
      lighter_name: form.name,
      message: form.message,
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
    <section className="py-24 px-6" style={{ background: "#1a1410" }}>
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

        <h2
          className="text-3xl md:text-4xl font-semibold mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: "#e5d5c0" }}
        >
          Ein Licht entzünden
        </h2>
        <p className="font-light mb-3 text-base" style={{ color: "#a09070" }}>
          {candles.length > 0
            ? `${candles.length} ${candles.length === 1 ? "Kerze brennt" : "Kerzen brennen"} zum Gedenken`
            : "Entzünden Sie eine Kerze — als stilles Zeichen Ihrer Verbundenheit."}
        </p>
        {candles.length === 0 && (
          <p className="text-sm italic mb-8" style={{ color: "#6b5a44", fontFamily: "'Playfair Display', serif" }}>
            „Ein kleines Licht vertreibt viel Dunkel."
          </p>
        )}

        {/* Candles grid */}
        {candles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 mb-10 py-4">
            {candles.slice(0, 24).map((c) => (
              <CandleSVG key={c.id} name={c.lighter_name} message={c.message} />
            ))}
          </div>
        )}

        {done && (
          <div
            className="mb-8 px-6 py-3 rounded-full inline-block text-sm"
            style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", fontFamily: "'Playfair Display', serif" }}
          >
            Ihre Kerze brennt nun — herzlichen Dank.
          </div>
        )}

        {!showing ? (
          <Button
            onClick={() => setShowing(true)}
            className="rounded-full px-8 py-5 text-white text-sm tracking-wide"
            style={{ background: "linear-gradient(135deg,#b45309,#92400e)" }}
          >
            Kerze entzünden
          </Button>
        ) : (
          <div className="max-w-sm mx-auto space-y-3 text-left mt-6">
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
                className="flex-1 text-white rounded-xl"
                style={{ background: "#b45309" }}
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