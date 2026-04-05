import { useState } from "react";
import { AlignLeft, AlignCenter, AlignRight, ArrowUp, ArrowDown, Minus, Type, Palette, Image as ImageIcon, RotateCcw } from "lucide-react";

const FONTS = [
  { id: "Cormorant Garamond", label: "Garamond" },
  { id: "DM Sans", label: "DM Sans" },
  { id: "Georgia", label: "Georgia" },
];

export const DEFAULT_SETTINGS = {
  textAlign: "center",
  textPosition: "bottom",
  showPortrait: true,
  portraitPosition: "top",
  portraitSize: "medium",
  fontSize: "normal",
  motifOpacity: 80,
  overlayIntensity: 60,
  fontFamily: "Cormorant Garamond",
  nameColor: "#f0ede8",
  dateColor: "#c9a96e",
  quoteColor: "#f5e6b8",
};

export default function CardDesignControls({ settings, onChange, hasPortrait = false, variant = "compact" }) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const set = (key, value) => onChange({ ...s, [key]: value });
  const [openSection, setOpenSection] = useState(null);
  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);
  const isOpen = (id) => variant === "full" || openSection === id;

  const Btn = ({ active, onClick, children, extraStyle = {} }) => (
    <button onClick={onClick}
      className="flex-1 py-2.5 rounded-lg text-xs transition-all"
      style={{
        background: active ? "rgba(201,169,110,0.15)" : "#f7f3ed",
        color: active ? "#c9a96e" : "#6b7280",
        border: `1px solid ${active ? "#c9a96e" : "#e5e7eb"}`,
        minHeight: 44,
        fontFamily: "'DM Sans', sans-serif",
        ...extraStyle,
      }}>
      {children}
    </button>
  );

  const Section = ({ id, icon: Icon, label, children }) => (
    <div className="border-b last:border-0" style={{ borderColor: "#f0ebe3" }}>
      {variant === "compact" && (
        <button onClick={() => toggle(id)} className="w-full flex items-center justify-between py-2.5 text-left">
          <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5" style={{ color: "#c9a96e" }} />
            <span className="text-xs font-medium" style={{ color: "#2c2419", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
          </div>
          <span className="text-xs" style={{ color: "#8a8278" }}>{openSection === id ? "−" : "+"}</span>
        </button>
      )}
      {variant === "full" && (
        <p className="text-xs font-medium pt-3 pb-2 flex items-center gap-1.5" style={{ color: "#2c2419" }}>
          <Icon className="w-3.5 h-3.5" style={{ color: "#c9a96e" }} />{label}
        </p>
      )}
      {isOpen(id) && <div className="pb-3 space-y-3">{children}</div>}
    </div>
  );

  return (
    <div className="rounded-xl p-4" style={{ background: "white", border: "1px solid #e8dfd0" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8a8278" }}>Gestaltung</p>
        <button onClick={() => onChange(DEFAULT_SETTINGS)}
          className="text-xs flex items-center gap-1"
          style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = "#c9a96e"}
          onMouseLeave={e => e.currentTarget.style.color = "#8a8278"}>
          <RotateCcw className="w-3 h-3" /> Zurücksetzen
        </button>
      </div>

      <Section id="align" icon={AlignCenter} label="Textausrichtung">
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Horizontal</p>
          <div className="flex gap-1.5">
            {[
              { val: "left", icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Links" },
              { val: "center", icon: <AlignCenter className="w-3.5 h-3.5" />, label: "Mitte" },
              { val: "right", icon: <AlignRight className="w-3.5 h-3.5" />, label: "Rechts" },
            ].map(o => (
              <Btn key={o.val} active={s.textAlign === o.val} onClick={() => set("textAlign", o.val)}>
                <span className="flex items-center justify-center gap-1">{o.icon}{o.label}</span>
              </Btn>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Vertikal</p>
          <div className="flex gap-1.5">
            {[
              { val: "top", icon: <ArrowUp className="w-3.5 h-3.5" />, label: "Oben" },
              { val: "center", icon: <Minus className="w-3.5 h-3.5" />, label: "Mitte" },
              { val: "bottom", icon: <ArrowDown className="w-3.5 h-3.5" />, label: "Unten" },
            ].map(o => (
              <Btn key={o.val} active={s.textPosition === o.val} onClick={() => set("textPosition", o.val)}>
                <span className="flex items-center justify-center gap-1">{o.icon}{o.label}</span>
              </Btn>
            ))}
          </div>
        </div>
      </Section>

      {hasPortrait && (
        <Section id="portrait" icon={ImageIcon} label="Portrait">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "#2c2419", fontFamily: "'DM Sans', sans-serif" }}>Portrait anzeigen</span>
            <button onClick={() => set("showPortrait", !s.showPortrait)}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
              style={{ background: s.showPortrait ? "#c9a96e" : "#e5e7eb" }}>
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                style={{ transform: s.showPortrait ? "translateX(18px)" : "translateX(2px)" }} />
            </button>
          </div>
          {s.showPortrait && (
            <>
              <div>
                <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Größe</p>
                <div className="flex gap-1.5">
                  {[{ val: "small", label: "Klein" }, { val: "medium", label: "Mittel" }, { val: "large", label: "Groß" }].map(o => (
                    <Btn key={o.val} active={s.portraitSize === o.val} onClick={() => set("portraitSize", o.val)}>{o.label}</Btn>
                  ))}
                </div>
              </div>
            </>
          )}
        </Section>
      )}

      <Section id="typography" icon={Type} label="Schrift">
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Schriftart</p>
          <div className="flex gap-1.5">
            {FONTS.map(f => (
              <Btn key={f.id} active={s.fontFamily === f.id} onClick={() => set("fontFamily", f.id)} extraStyle={{ fontFamily: f.id }}>
                {f.label}
              </Btn>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Textgröße</p>
          <div className="flex gap-1.5">
            {[{ val: "small", label: "Klein" }, { val: "normal", label: "Normal" }, { val: "large", label: "Groß" }].map(o => (
              <Btn key={o.val} active={s.fontSize === o.val} onClick={() => set("fontSize", o.val)}>{o.label}</Btn>
            ))}
          </div>
        </div>
      </Section>

      <Section id="motif" icon={Palette} label="Motiv & Helligkeit">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs" style={{ color: "#8a8278" }}>Motiv-Deckkraft</p>
            <span className="text-xs font-mono" style={{ color: "#c9a96e" }}>{s.motifOpacity}%</span>
          </div>
          <input type="range" min={20} max={100} value={s.motifOpacity}
            onChange={e => set("motifOpacity", parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #c9a96e ${s.motifOpacity}%, #e5e7eb ${s.motifOpacity}%)` }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs" style={{ color: "#8a8278" }}>Abdunklung</p>
            <span className="text-xs font-mono" style={{ color: "#c9a96e" }}>{s.overlayIntensity}%</span>
          </div>
          <input type="range" min={0} max={90} value={s.overlayIntensity}
            onChange={e => set("overlayIntensity", parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #c9a96e ${s.overlayIntensity}%, #e5e7eb ${s.overlayIntensity}%)` }} />
        </div>
      </Section>
    </div>
  );
}