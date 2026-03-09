import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function CandleSVG({ name, message }) {
  return (
    <div className="flex flex-col items-center group cursor-default" title={message || name}>
      <svg width="32" height="56" viewBox="0 0 32 56" className="candle-flame">
        {/* Flame */}
        <ellipse cx="16" cy="8" rx="5" ry="7" fill="#f59e0b" opacity="0.9" />
        <ellipse cx="16" cy="10" rx="3" ry="5" fill="#fcd34d" opacity="0.8" />
        <ellipse cx="16" cy="6" rx="2" ry="4" fill="#fef3c7" opacity="0.7" />
        {/* Wick */}
        <line x1="16" y1="14" x2="16" y2="18" stroke="#374151" strokeWidth="1.5" />
        {/* Candle body */}
        <rect x="11" y="18" width="10" height="34" rx="2" fill="#f5f0e8" />
        <rect x="11" y="18" width="10" height="4" rx="2" fill="#e7e0d4" />
        {/* Glow */}
        <ellipse cx="16" cy="18" rx="12" ry="5" fill="#fbbf24" opacity="0.15" />
      </svg>
      <p className="text-xs text-gray-500 mt-1 max-w-[60px] text-center leading-tight truncate">{name}</p>
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
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <section className="py-20 px-6" style={{ background: "#1c1917" }}>
      <div className="max-w-4xl mx-auto text-center">
        <Flame className="w-8 h-8 mx-auto mb-4 text-amber-400" />
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Virtuelle Kerzen
        </h2>
        <p className="text-stone-400 mb-4 font-light">
          {candles.length > 0 ? `${candles.length} Kerze${candles.length !== 1 ? "n" : ""} wurden entzündet` : "Entzünden Sie eine Kerze zum Gedenken"}
        </p>

        {/* Candles grid */}
        {candles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {candles.slice(0, 24).map((c) => (
              <CandleSVG key={c.id} name={c.lighter_name} message={c.message} />
            ))}
          </div>
        )}

        {done && (
          <div className="mb-6 px-6 py-3 rounded-full inline-block text-amber-400 text-sm" style={{ background: "rgba(217,119,6,0.15)" }}>
            ✓ Ihre Kerze wurde entzündet
          </div>
        )}

        {!showing ? (
          <Button
            onClick={() => setShowing(true)}
            className="rounded-full px-8 text-white"
            style={{ background: "linear-gradient(135deg,#b45309,#92400e)" }}
          >
            <Flame className="w-4 h-4 mr-2" />
            Kerze entzünden
          </Button>
        ) : (
          <div className="max-w-sm mx-auto space-y-3 text-left">
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ihr Name *"
              className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 rounded-xl"
            />
            <Textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Eine persönliche Nachricht (optional)"
              className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 rounded-xl h-20 resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={light}
                disabled={!form.name.trim() || loading}
                className="flex-1 text-white rounded-xl"
                style={{ background: "#b45309" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Flame className="w-4 h-4 mr-2" /> Entzünden</>}
              </Button>
              <Button variant="outline" onClick={() => setShowing(false)} className="rounded-xl border-stone-600 text-stone-400 bg-transparent">
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}