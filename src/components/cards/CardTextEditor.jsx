import { QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const fontOptions = ["Cormorant Garamond", "DM Sans", "Georgia"];

export default function CardTextEditor({ texts, onChange, showQr, onToggleQr }) {
  const set = (k, v) => onChange({ ...texts, [k]: v });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Texte anpassen
        </h3>
        <p className="text-sm text-gray-500">Alle Texte werden auf Ihrer Karte angezeigt.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Name</Label>
          <Input value={texts.name || ""} onChange={(e) => set("name", e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Geburtsjahr</Label>
            <Input value={texts.birth || ""} onChange={(e) => set("birth", e.target.value)} placeholder="1940" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sterbejahr</Label>
            <Input value={texts.death || ""} onChange={(e) => set("death", e.target.value)} placeholder="2024" className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Zitat / Leitspruch</Label>
          <Textarea value={texts.quote || ""} onChange={(e) => set("quote", e.target.value)} className="mt-1 resize-none h-16 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Innentext / Einladungstext</Label>
          <Textarea value={texts.body || ""} onChange={(e) => set("body", e.target.value)} className="mt-1 resize-none h-24 text-sm"
            placeholder="z. B. Wir laden Sie herzlich ein zur Trauerfeier am…" />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Schriftart</Label>
          <div className="flex gap-2 mt-1">
            {fontOptions.map((f) => (
              <button
                key={f}
                onClick={() => set("font", f)}
                className="px-3 py-1.5 rounded-lg text-xs border transition-all"
                style={{
                  fontFamily: f,
                  borderColor: texts.font === f ? "#c9a96e" : "#e5e7eb",
                  background: texts.font === f ? "rgba(201,169,110,0.08)" : "white",
                  color: texts.font === f ? "#c9a96e" : "#6b7280",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code toggle */}
      <div
        onClick={onToggleQr}
        className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all"
        style={{ borderColor: showQr ? "#c9a84c" : "#e5e7eb", background: showQr ? "#fef9ee" : "#fafaf8" }}
      >
        <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
          style={{ borderColor: showQr ? "#c9a96e" : "#d1d5db", background: showQr ? "#c9a96e" : "white" }}>
          {showQr && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <QrCode className="w-4 h-4 flex-shrink-0" style={{ color: showQr ? "#c9a96e" : "#9ca3af" }} />
        <div>
          <p className="text-sm font-medium text-gray-700">QR-Code auf Rückseite</p>
          <p className="text-xs text-gray-400">Verweist auf die digitale Gedenkseite</p>
        </div>
      </div>
    </div>
  );
}