import { useState } from "react";
import {
  Heart, Flame, QrCode, BookOpen, Users, ImageIcon, Lock, CheckCircle,
  XCircle, Upload, ChevronRight, Feather, TreePine,
  Home, Settings, BarChart3, CreditCard, Globe, Package,
  Plus
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const T = {
  ivory: "#F7F3ED",
  sand: "#EDE3D3",
  champagne: "#D8C3A5",
  taupe: "#A89A8A",
  anthracite: "#2F2D2A",
  gold: "#B07B34",
  bordeaux: "#7A3142",
  white: "#FFFFFF",
  cardBg: "#FDFAF6",
  border: "#E5DBD0",
  softBorder: "#EDE3D3",
};

const serif = { fontFamily: "'Cormorant Garamond', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────

function Section({ title, subtitle, children, bg = T.ivory, id }) {
  return (
    <section id={id} style={{ background: bg, padding: "64px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {title && (
          <div style={{ marginBottom: 40 }}>
            <p style={{ ...sans, fontSize: 11, letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: 8 }}>Design System</p>
            <h2 style={{ ...serif, fontSize: 32, color: T.anthracite, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
            {subtitle && <p style={{ ...sans, fontSize: 14, color: T.taupe, lineHeight: 1.7 }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Label({ children }) {
  return <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.taupe, textTransform: "uppercase", marginBottom: 8 }}>{children}</p>;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// Button variants
function Btn({ children, variant = "primary", size = "md", icon }) {
  const styles = {
    primary: { background: T.gold, color: T.white, border: "none" },
    secondary: { background: "transparent", color: T.gold, border: `1.5px solid ${T.gold}` },
    ghost: { background: "transparent", color: T.anthracite, border: `1px solid ${T.border}` },
    soft: { background: T.sand, color: T.anthracite, border: "none" },
    danger: { background: "transparent", color: T.bordeaux, border: `1px solid ${T.bordeaux}` },
  };
  const sizes = {
    sm: { padding: "8px 18px", fontSize: 12, borderRadius: 10 },
    md: { padding: "11px 24px", fontSize: 13, borderRadius: 12 },
    lg: { padding: "14px 32px", fontSize: 15, borderRadius: 14 },
  };
  return (
    <button style={{ ...sans, ...styles[variant], ...sizes[size], display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}>
      {icon && icon}
      {children}
    </button>
  );
}

// Input field
function InputField({ label, placeholder, type = "text", icon }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {label && <label style={{ ...sans, fontSize: 12, color: T.anthracite, display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.taupe }}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          style={{
            ...sans, width: "100%", padding: icon ? "11px 16px 11px 42px" : "11px 16px",
            background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
            color: T.anthracite, fontSize: 13, outline: "none", boxSizing: "border-box",
          }}
          readOnly
        />
      </div>
    </div>
  );
}

// Card wrapper
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.cardBg, border: `1px solid ${T.border}`,
      borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(47,45,42,0.06)",
      ...style
    }}>
      {children}
    </div>
  );
}

// Badge
function Badge({ children, color = T.gold }) {
  return (
    <span style={{
      ...sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
      background: `${color}18`, color, border: `1px solid ${color}30`,
      padding: "3px 10px", borderRadius: 100,
    }}>
      {children}
    </span>
  );
}

// ─── LOGO COMPONENT ────────────────────────────────────────────────────────────

function EvertraceLogo({ size = 1, dark = true }) {
  const color = dark ? T.anthracite : T.white;
  const accent = T.gold;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * size }}>
      {/* Lebensbaum SVG */}
      <svg width={48 * size} height={52 * size} viewBox="0 0 48 52" fill="none">
        {/* Roots */}
        <path d="M24 48 C20 48 16 46 14 44" stroke={accent} strokeWidth={1.5} strokeLinecap="round" opacity="0.5" />
        <path d="M24 48 C28 48 32 46 34 44" stroke={accent} strokeWidth={1.5} strokeLinecap="round" opacity="0.5" />
        <path d="M24 48 V44" stroke={accent} strokeWidth={1.5} strokeLinecap="round" opacity="0.6" />
        {/* Trunk */}
        <path d="M24 44 V28" stroke={accent} strokeWidth={2} strokeLinecap="round" />
        {/* Main branches */}
        <path d="M24 36 C20 34 15 30 12 26" stroke={accent} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M24 36 C28 34 33 30 36 26" stroke={accent} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M24 30 C21 28 17 24 15 20" stroke={accent} strokeWidth={1.3} strokeLinecap="round" />
        <path d="M24 30 C27 28 31 24 33 20" stroke={accent} strokeWidth={1.3} strokeLinecap="round" />
        {/* Upper branches */}
        <path d="M24 24 C22 22 19 18 18 14" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M24 24 C26 22 29 18 30 14" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M24 20 V8" stroke={accent} strokeWidth={1.5} strokeLinecap="round" />
        {/* Leaves / dots */}
        {[[12, 25], [36, 25], [15, 19], [33, 19], [18, 13], [30, 13], [24, 7]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.2} fill={accent} opacity={0.7 - i * 0.05} />
        ))}
      </svg>
      <span style={{ ...serif, fontSize: 18 * size, color, letterSpacing: "0.04em", fontWeight: 600 }}>
        Evertrace
      </span>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("memorials");

  const sections = [
    { id: "brand", label: "Marke & Farben" },
    { id: "typography", label: "Typografie" },
    { id: "controls", label: "Elemente" },
    { id: "cards", label: "Karten" },
    { id: "navigation", label: "Navigation" },
    { id: "memorial", label: "Gedenkseite" },
    { id: "family", label: "Familienbeiträge" },
    { id: "moderation", label: "Freigabe" },
    { id: "qr", label: "QR & Produkte" },
    { id: "dashboard", label: "Bestatter" },
    { id: "mobile", label: "Mobile" },
  ];

  return (
    <div style={{ background: T.ivory, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Top bar ─────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(247,243,237,0.95)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.border}`, padding: "12px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <EvertraceLogo size={0.8} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                style={{ ...sans, fontSize: 11, color: T.taupe, textDecoration: "none", padding: "5px 12px", borderRadius: 8, background: T.sand }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(160deg, ${T.anthracite} 0%, #3d3630 100%)`, padding: "80px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Watermark logo */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.05 }}>
          <EvertraceLogo size={5} dark={false} />
        </div>
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <p style={{ ...sans, fontSize: 11, letterSpacing: "0.3em", color: T.gold, textTransform: "uppercase", marginBottom: 16 }}>UX/UI Design System · Stil 2 — Warm & Würdevoll</p>
          <h1 style={{ ...serif, fontSize: 52, color: T.ivory, fontWeight: 600, lineHeight: 1.15, marginBottom: 20 }}>
            Evertrace<br /><span style={{ color: T.champagne, fontStyle: "italic" }}>Design System</span>
          </h1>
          <p style={{ ...sans, fontSize: 15, color: T.taupe, lineHeight: 1.8, maxWidth: 500, margin: "0 auto" }}>
            Warm · Familiär · Würdevoll · Ruhig · Vertrauensvoll<br />
            Digitale Erinnerung für Generationen
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* 1. FARBPALETTE                                     */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="brand" title="Farbpalette" subtitle="Warm, geerdet und würdevoll — die Farbwelt von Evertrace.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { name: "Elfenbein", hex: "#F7F3ED", role: "Haupt-Hintergrund", dark: true },
            { name: "Sandbeige", hex: "#EDE3D3", role: "Warme Flächen", dark: true },
            { name: "Champagner", hex: "#D8C3A5", role: "Akzentflächen", dark: true },
            { name: "Taupe", hex: "#A89A8A", role: "Sekundäre Texte", dark: false },
            { name: "Anthrazit", hex: "#2F2D2A", role: "Typografie", dark: false },
            { name: "Goldbraun", hex: "#B07B34", role: "Markenakzent", dark: false },
            { name: "Bordeaux", hex: "#7A3142", role: "Edler Akzent (sparsam)", dark: false },
            { name: "Weiß", hex: "#FFFFFF", role: "Karten & Formulare", dark: true },
          ].map(c => (
            <div key={c.hex}>
              <div style={{ height: 100, borderRadius: 16, background: c.hex, border: `1px solid ${T.border}`, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
              <p style={{ ...sans, fontSize: 13, fontWeight: 600, color: T.anthracite, marginBottom: 2 }}>{c.name}</p>
              <p style={{ ...sans, fontSize: 11, color: T.taupe, fontFamily: "monospace", marginBottom: 2 }}>{c.hex}</p>
              <p style={{ ...sans, fontSize: 11, color: T.taupe }}>{c.role}</p>
            </div>
          ))}
        </div>

        {/* Gradient strip */}
        <div style={{ height: 48, borderRadius: 16, background: `linear-gradient(to right, ${T.anthracite}, #3d3630, ${T.taupe}, ${T.champagne}, ${T.sand}, ${T.ivory})`, marginBottom: 12 }} />
        <p style={{ ...sans, fontSize: 12, color: T.taupe }}>Farbverlauf — von Anthrazit zu Elfenbein — die natürliche Stimmungsachse der Marke</p>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 2. TYPOGRAFIE                                      */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="typography" title="Typografie-System" subtitle="Cormorant Garamond für Seele, DM Sans für Klarheit." bg={T.sand}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <Label>Cormorant Garamond — Serif · Titel & Emotionen</Label>
            <div style={{ ...serif, color: T.anthracite, marginTop: 12 }}>
              <p style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.1, marginBottom: 8 }}>In liebevoller<br />Erinnerung</p>
              <p style={{ fontSize: 28, fontWeight: 400, fontStyle: "italic", color: T.gold, marginBottom: 8 }}>„Was war, bleibt für immer."</p>
              <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Lebensgeschichten · Familienbände</p>
              <p style={{ fontSize: 16, color: T.taupe, lineHeight: 1.9 }}>Dieser Mensch liebte das Leben in seiner ganzen Fülle und hinterließ in jedem, der ihm begegnete, einen bleibenden Eindruck.</p>
            </div>
          </div>
          <div>
            <Label>DM Sans — Sans-Serif · Navigation & Fließtext</Label>
            <div style={{ ...sans, color: T.anthracite, marginTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>Digitale Gedenkseite</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Erinnerungen bewahren</p>
              <p style={{ fontSize: 14, color: T.taupe, lineHeight: 1.8, marginBottom: 16 }}>Teilen Sie Fotos, Geschichten und Erinnerungen — für die Familie und alle, die ihn kannten.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["48px / 600", "Haupttitel (Cormorant)"], ["32px / 600", "Seitentitel"], ["24px / 500", "Abschnittstitel"], ["16px / 400", "Fließtext"], ["13px / 400", "Körpertext"], ["11px / 600", "Label / Caps"]].map(([spec, role]) => (
                  <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 12, color: T.anthracite, fontFamily: "monospace" }}>{spec}</span>
                    <span style={{ fontSize: 12, color: T.taupe }}>{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 3. BUTTONS & EINGABEFELDER                         */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="controls" title="Buttons & Eingabefelder" subtitle="Weich, klar, einladend — nie aggressiv.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Buttons */}
          <div>
            <Label>Button-Varianten</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn variant="primary">Gedenkseite erstellen</Btn>
                <Btn variant="secondary">Mehr erfahren</Btn>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn variant="ghost">Abbrechen</Btn>
                <Btn variant="soft" icon={<Heart size={14} />}>Kerze entzünden</Btn>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn size="sm" variant="primary">Klein</Btn>
                <Btn size="md" variant="primary">Mittel</Btn>
                <Btn size="lg" variant="primary">Groß</Btn>
              </div>
              <Btn variant="danger" icon={<XCircle size={14} />}>Ablehnen</Btn>
            </div>
          </div>

          {/* Inputs */}
          <div>
            <Label>Eingabefelder</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
              <InputField label="Vollständiger Name" placeholder="Maria Müller" icon={<Feather size={14} />} />
              <InputField label="E-Mail-Adresse" placeholder="maria@familie.de" type="email" />
              <div>
                <label style={{ ...sans, fontSize: 12, color: T.anthracite, display: "block", marginBottom: 6, fontWeight: 500 }}>Biografie / Lebensgeschichte</label>
                <textarea placeholder="Erzählen Sie uns von diesem Menschen…" rows={3} readOnly
                  style={{ ...sans, width: "100%", padding: "11px 16px", background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, color: T.anthracite, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ ...sans, fontSize: 11, color: T.taupe }}>oder</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>
              <div style={{ border: `2px dashed ${T.champagne}`, borderRadius: 14, padding: "20px", textAlign: "center", cursor: "pointer" }}>
                <Upload size={20} style={{ color: T.taupe, margin: "0 auto 8px" }} />
                <p style={{ ...sans, fontSize: 12, color: T.taupe }}>Foto hochladen · JPG, PNG, max. 10 MB</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 4. KARTEN-DESIGNS                                  */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="cards" title="Karten-Designs" subtitle="Würdevolle Flächen für Erinnerungen, Profile und Inhalte." bg={T.sand}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>

          {/* Memorial profile card */}
          <Card>
            <div style={{ height: 120, borderRadius: 14, background: `linear-gradient(160deg, ${T.anthracite}, #3d3630)`, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60) center/cover", opacity: 0.4 }} />
              <div style={{ position: "relative", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.gold}`, background: T.champagne, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ ...serif, fontSize: 22, color: T.anthracite }}>M</span>
                </div>
              </div>
            </div>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 4 }}>In liebevoller Erinnerung</p>
            <h3 style={{ ...serif, fontSize: 22, color: T.anthracite, marginBottom: 4 }}>Maria Müller</h3>
            <p style={{ ...sans, fontSize: 12, color: T.taupe, marginBottom: 12 }}>* 14. März 1942 · † 3. Januar 2024</p>
            <p style={{ ...serif, fontSize: 14, color: T.taupe, fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
              „Was wir lieben, hören wir niemals auf zu lieben."
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ ...serif, fontSize: 20, color: T.anthracite, fontWeight: 600 }}>48</p>
                <p style={{ ...sans, fontSize: 10, color: T.taupe }}>Kerzen</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ ...serif, fontSize: 20, color: T.anthracite, fontWeight: 600 }}>127</p>
                <p style={{ ...sans, fontSize: 10, color: T.taupe }}>Besuche</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ ...serif, fontSize: 20, color: T.anthracite, fontWeight: 600 }}>23</p>
                <p style={{ ...sans, fontSize: 10, color: T.taupe }}>Beiträge</p>
              </div>
            </div>
          </Card>

          {/* Photo memory card */}
          <Card>
            <div style={{ height: 160, borderRadius: 14, background: `url(https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=60) center/cover`, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ ...serif, fontSize: 13, color: T.white }}>T</span>
              </div>
              <div>
                <p style={{ ...sans, fontSize: 13, color: T.anthracite, fontWeight: 500 }}>Thomas Müller</p>
                <p style={{ ...sans, fontSize: 11, color: T.taupe }}>Sohn · 18. Jan. 2024</p>
              </div>
            </div>
            <p style={{ ...serif, fontSize: 15, color: T.anthracite, fontStyle: "italic", lineHeight: 1.8 }}>
              „Dieser Moment am Bodensee — Mama liebte die Stille des frühen Morgens."
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Badge>Foto</Badge>
              <Badge color={T.taupe}>Erinnerung</Badge>
            </div>
          </Card>

          {/* Pending approval card */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.taupe, textTransform: "uppercase", marginBottom: 4 }}>Zur Freigabe</p>
                <h3 style={{ ...serif, fontSize: 18, color: T.anthracite }}>Kondolenz</h3>
              </div>
              <Badge color={T.gold}>Ausstehend</Badge>
            </div>
            <div style={{ background: T.ivory, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ ...sans, fontSize: 12, fontWeight: 500, color: T.anthracite, marginBottom: 4 }}>Hannelore Brandt</p>
              <p style={{ ...serif, fontSize: 14, color: T.taupe, fontStyle: "italic", lineHeight: 1.8 }}>
                „Maria war für mich wie eine zweite Mutter. Ihre Güte werde ich nie vergessen."
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, ...sans, fontSize: 12, fontWeight: 500, padding: "9px 0", borderRadius: 10, background: T.sand, color: T.anthracite, border: "none", cursor: "pointer" }}>Ablehnen</button>
              <button style={{ flex: 1, ...sans, fontSize: 12, fontWeight: 600, padding: "9px 0", borderRadius: 10, background: T.gold, color: T.white, border: "none", cursor: "pointer" }}>Freigeben</button>
            </div>
          </Card>

          {/* B2B case card */}
          <Card style={{ background: "#1e1c19", border: "1px solid #302d28" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <Badge color={T.champagne}>Aktiv</Badge>
              <span style={{ ...sans, fontSize: 11, color: "#5a554e" }}>Fall #2024-084</span>
            </div>
            <h3 style={{ ...serif, fontSize: 20, color: T.ivory, marginBottom: 4 }}>Ernst Hoffmann</h3>
            <p style={{ ...sans, fontSize: 12, color: "#8a8278", marginBottom: 14 }}>† 15. März 2024 · Erdbestattung</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["✓ Trauerkarte", T.gold], ["✓ Gedenkseite", "#4ade80"], ["⏳ Bestellung", T.taupe]].map(([l, c]) => (
                <span key={l} style={{ ...sans, fontSize: 10, color: c, background: `${c}18`, padding: "3px 8px", borderRadius: 6 }}>{l}</span>
              ))}
            </div>
            <button style={{ width: "100%", ...sans, fontSize: 12, fontWeight: 500, padding: "9px 0", borderRadius: 10, background: T.gold, color: "#0f0e0c", border: "none", cursor: "pointer" }}>Fall öffnen →</button>
          </Card>

          {/* Product card */}
          <Card>
            <div style={{ height: 140, borderRadius: 14, background: `linear-gradient(145deg, ${T.sand}, ${T.champagne})`, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode size={48} style={{ color: T.anthracite, opacity: 0.4 }} />
            </div>
            <Badge>Grabplakette</Badge>
            <h3 style={{ ...serif, fontSize: 20, color: T.anthracite, marginTop: 10, marginBottom: 6 }}>Edelstahl Premium</h3>
            <p style={{ ...sans, fontSize: 12, color: T.taupe, lineHeight: 1.7, marginBottom: 14 }}>Mit QR-Code · Lasergravur · 20 × 11 cm · wetterfest · inkl. Montagekit</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ ...serif, fontSize: 24, color: T.anthracite, fontWeight: 600 }}>€ 219,–</p>
              <Btn size="sm" variant="primary">Bestellen</Btn>
            </div>
          </Card>

          {/* Stats card */}
          <Card style={{ background: `linear-gradient(160deg, ${T.champagne}40, ${T.sand})` }}>
            <p style={{ ...sans, fontSize: 11, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 16 }}>Monatsstatistik</p>
            {[["Neue Fälle", "12", "+3"], ["Gedruckte Karten", "480", "+80"], ["Gedenkseiten", "8", "+2"], ["Plaketten", "5", "+1"]].map(([label, val, diff]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ ...sans, fontSize: 13, color: T.anthracite }}>{label}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ ...serif, fontSize: 20, color: T.anthracite, fontWeight: 600 }}>{val}</span>
                  <span style={{ ...sans, fontSize: 11, color: "#4ade80" }}>{diff}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 5. NAVIGATION                                       */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="navigation" title="Navigationsleisten" subtitle="Drei Kontexte: öffentlich, Familienbereich, Bestatter-Dashboard.">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Public nav */}
          <div>
            <Label>Öffentliche Navigationsleiste</Label>
            <div style={{ background: `rgba(47,45,42,0.96)`, borderRadius: 16, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)" }}>
              <EvertraceLogo size={0.7} dark={false} />
              <div style={{ display: "flex", gap: 6 }}>
                {["Gedenkseiten", "Trauerkarten", "Lebensgeschichten"].map(l => (
                  <button key={l} style={{ ...sans, fontSize: 13, color: "#8a8278", background: "none", border: "none", padding: "6px 14px", cursor: "pointer", borderRadius: 8 }}>{l}</button>
                ))}
              </div>
              <button style={{ ...sans, fontSize: 13, fontWeight: 500, padding: "8px 18px", background: T.gold, color: T.anthracite, border: "none", borderRadius: 10, cursor: "pointer" }}>Anmelden</button>
            </div>
          </div>

          {/* Family area nav */}
          <div>
            <Label>Familienbereich — Tabs</Label>
            <div style={{ background: T.white, borderRadius: 16, padding: "16px 20px", border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", gap: 4, background: T.ivory, borderRadius: 12, padding: 4, width: "fit-content" }}>
                {["Erinnerungen", "Fotos", "Stammbaum", "Briefe", "Einstellungen"].map((t, i) => (
                  <button key={t} style={{
                    ...sans, fontSize: 12, padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                    background: i === 0 ? T.white : "transparent",
                    color: i === 0 ? T.anthracite : T.taupe,
                    fontWeight: i === 0 ? 600 : 400,
                    boxShadow: i === 0 ? "0 1px 4px rgba(47,45,42,0.08)" : "none",
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* B2B sidebar preview */}
          <div>
            <Label>Bestatter-Sidebar (Desktop)</Label>
            <div style={{ display: "flex", gap: 0, borderRadius: 16, overflow: "hidden", border: `1px solid #302d28`, maxHeight: 320 }}>
              <div style={{ width: 200, background: "#181714", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ padding: "0 12px 16px", borderBottom: "1px solid #302d28", marginBottom: 12 }}>
                  <EvertraceLogo size={0.65} dark={false} />
                </div>
                {[
                  [LayoutIcon, "Übersicht", true],
                  [Users, "Fälle", false, 12],
                  [CreditCard, "Trauerkarten", false],
                  [Globe, "Gedenkseiten", false, 3],
                  [Package, "Bestellungen", false, 2],
                  [BarChart3, "Analysen", false],
                  [Settings, "Einstellungen", false],
                ].map(([Icon, label, active, badge]) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                    background: active ? "rgba(176,123,52,0.12)" : "transparent",
                    borderLeft: `2px solid ${active ? T.gold : "transparent"}`,
                  }}>
                    {Icon && <Icon size={15} style={{ color: active ? T.gold : "#5a554e", flexShrink: 0 }} />}
                    <span style={{ ...sans, fontSize: 12, color: active ? T.gold : "#8a8278", flex: 1 }}>{label}</span>
                    {badge && <span style={{ ...sans, fontSize: 10, background: T.gold, color: "#0f0e0c", padding: "2px 6px", borderRadius: 100, fontWeight: 700 }}>{badge}</span>}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, background: "#0f0e0c", padding: 24 }}>
                <p style={{ ...serif, fontSize: 20, color: T.ivory, marginBottom: 4 }}>Übersicht</p>
                <p style={{ ...sans, fontSize: 12, color: "#5a554e", marginBottom: 20 }}>Willkommen zurück, Bestattungshaus Müller.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Aktive Fälle", "12"], ["Karten im Druck", "3"], ["Gedenkseiten", "8"], ["Ausstehend", "2"]].map(([l, v]) => (
                    <div key={l} style={{ background: "#181714", border: "1px solid #302d28", borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ ...sans, fontSize: 11, color: "#5a554e", marginBottom: 4 }}>{l}</p>
                      <p style={{ ...serif, fontSize: 24, color: T.champagne, fontWeight: 600 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 6. GEDENKSEITE                                     */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="memorial" title="Erinnerungsseite — Vollansicht" subtitle="Die öffentliche Gedenkseite: würdevoll, ruhig, emotional bewegend." bg={T.ivory}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Hero */}
          <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 32, position: "relative", height: 340 }}>
            <div style={{ position: "absolute", inset: 0, background: "url(https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=70) center/cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,18,14,0.9) 0%, rgba(20,18,14,0.3) 60%, transparent 100%)" }} />
            <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center" }}>
              <p style={{ ...sans, fontSize: 10, letterSpacing: "0.3em", color: T.gold, textTransform: "uppercase", marginBottom: 8 }}>In liebevoller Erinnerung</p>
              <h1 style={{ ...serif, fontSize: 42, color: T.ivory, fontWeight: 600, marginBottom: 6 }}>Maria Müller</h1>
              <p style={{ ...serif, fontSize: 16, color: T.champagne, fontStyle: "italic" }}>* 14. März 1942 · † 3. Januar 2024</p>
            </div>
          </div>

          {/* Biography */}
          <Card style={{ marginBottom: 24 }}>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: 12 }}>Lebensgeschichte</p>
            <p style={{ ...serif, fontSize: 17, color: T.anthracite, lineHeight: 2, fontStyle: "italic" }}>
              Maria wuchs in den Weinbergen der Pfalz auf, wo der Duft von Most und frisch gebackenem Brot ihre Kindheit prägte. Sie lebte für ihre Familie, für die kleinen Momente am Morgen mit einer Tasse Kaffee und dem Blick in den Garten. Was auch immer das Leben brachte — sie begegnete ihm mit Wärme, Geduld und einem Lächeln, das jeden Raum erhellte.
            </p>
          </Card>

          {/* Photo gallery */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: 14 }}>Erinnerungsfotos</p>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
              <div style={{ borderRadius: 16, height: 160, background: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60) center/cover` }} />
              <div style={{ borderRadius: 16, height: 160, background: `url(https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=300&q=60) center/cover` }} />
              <div style={{ borderRadius: 16, height: 160, background: `linear-gradient(145deg, ${T.sand}, ${T.champagne})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ ...serif, fontSize: 24, color: T.anthracite }}>+12</p>
                  <p style={{ ...sans, fontSize: 11, color: T.taupe }}>weitere</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline snippet */}
          <Card style={{ marginBottom: 24 }}>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: 16 }}>Lebensstationen</p>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 1, background: T.champagne }} />
              {[["1942", "Geburt in Neustadt a. d. Weinstraße"],["1965", "Heirat mit Wilhelm Müller"],["1971", "Geburt des Sohnes Thomas"],["2004", "Silberhochzeit — Reise nach Florenz"],["2024", "In liebevoller Erinnerung"],].map(([year, event]) => (
                <div key={year} style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
                  <div style={{ position: "absolute", left: -28, top: 4, width: 10, height: 10, borderRadius: "50%", background: T.gold, border: `2px solid ${T.ivory}` }} />
                  <span style={{ ...serif, fontSize: 14, color: T.gold, fontWeight: 600, minWidth: 40 }}>{year}</span>
                  <span style={{ ...sans, fontSize: 13, color: T.anthracite, lineHeight: 1.6 }}>{event}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Candle section */}
          <div style={{ background: T.anthracite, borderRadius: 24, padding: "32px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
              {["Thomas", "Hannelore", "Klaus", "Anna"].map(name => (
                <div key={name} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>🕯</div>
                  <p style={{ ...sans, fontSize: 10, color: T.taupe }}>{name}</p>
                </div>
              ))}
            </div>
            <p style={{ ...serif, fontSize: 24, color: T.champagne, marginBottom: 12 }}>48 Kerzen brennen</p>
            <button style={{ ...sans, fontSize: 13, fontWeight: 500, padding: "11px 28px", borderRadius: 24, background: `linear-gradient(135deg, ${T.gold}, #8b5e24)`, color: T.white, border: "none", cursor: "pointer" }}>
              Kerze entzünden
            </button>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 7. FAMILIENBEITRÄGE                               */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="family" title="Familienbeitrags-Komponenten" subtitle="Erinnerungen teilen — persönlich, bewegend, einfach." bg={T.sand}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Contribution entry */}
          {[
            { name: "Thomas Müller", relation: "Sohn", text: "Mama, du hast uns immer gelehrt, das Schöne im Kleinen zu sehen. Dein Lachen fehlt uns jeden Tag.", date: "18. Jan. 2024", hasPhoto: true },
            { name: "Hannelore Brandt", relation: "Freundin · 50 Jahre", text: "Wir haben zusammen so viel erlebt — die Spaziergänge am Rhein, die langen Sommerabende. Du wirst für immer in meinem Herzen sein.", date: "20. Jan. 2024", hasPhoto: false },
          ].map(c => (
            <Card key={c.name}>
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.gold}, #8b5e24)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ ...serif, fontSize: 18, color: T.white }}>{c.name[0]}</span>
                </div>
                <div>
                  <p style={{ ...sans, fontSize: 14, fontWeight: 600, color: T.anthracite, marginBottom: 2 }}>{c.name}</p>
                  <p style={{ ...sans, fontSize: 12, color: T.taupe }}>{c.relation} · {c.date}</p>
                </div>
              </div>
              {c.hasPhoto && (
                <div style={{ height: 160, borderRadius: 14, background: `url(https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=60) center/cover`, marginBottom: 12 }} />
              )}
              <p style={{ ...serif, fontSize: 16, color: T.anthracite, fontStyle: "italic", lineHeight: 1.9 }}>„{c.text}"</p>
            </Card>
          ))}

          {/* Submission form */}
          <Card style={{ border: `2px solid ${T.champagne}` }}>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 14 }}>Erinnerung hinterlassen</p>
            <InputField label="Ihr Name" placeholder="Vor- und Nachname" />
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <label style={{ ...sans, fontSize: 12, color: T.anthracite, display: "block", marginBottom: 6, fontWeight: 500 }}>Ihre Erinnerung</label>
              <textarea placeholder="Teilen Sie eine Erinnerung, einen Gedanken, ein Gebet…" rows={4} readOnly
                style={{ ...sans, width: "100%", padding: "11px 16px", background: T.ivory, border: `1px solid ${T.border}`, borderRadius: 12, color: T.anthracite, fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...sans, fontSize: 12, padding: "9px 16px", borderRadius: 10, background: T.sand, border: "none", color: T.anthracite, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Flame size={14} style={{ color: T.gold }} /> Kerze
              </button>
              <button style={{ ...sans, fontSize: 12, padding: "9px 16px", borderRadius: 10, background: T.sand, border: "none", color: T.anthracite, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Image size={14} /> Foto
              </button>
              <button style={{ ...sans, flex: 1, fontSize: 13, fontWeight: 600, padding: "9px 0", borderRadius: 10, background: T.gold, color: T.white, border: "none", cursor: "pointer" }}>
                Senden
              </button>
            </div>
          </Card>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 8. FREIGABE & MODERATION                          */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="moderation" title="Freigabe & Moderation" subtitle="Würdevolle Kontrolle — einfach, klar, respektvoll.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Moderation queue */}
          <div>
            <Label>Freigabe-Warteschlange</Label>
            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...serif, fontSize: 16, color: T.anthracite }}>Ausstehende Beiträge</span>
                <Badge color={T.bordeaux}>3 offen</Badge>
              </div>
              {/* Items */}
              {[
                { name: "Hannelore Brandt", type: "Kondolenz", preview: "Maria war für mich wie...", time: "vor 2 Std." },
                  { name: "Klaus Fischer", type: "Erinnerungsfoto", preview: "Foto vom Sommerfest 2019", time: "vor 4 Std." },
                  { name: "Familie Berger", type: "Nachricht", preview: "Wir denken an Sie...", time: "gestern" },
              ].map((item, i) => (
                <div key={item.name} style={{ padding: "14px 20px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <p style={{ ...sans, fontSize: 13, fontWeight: 500, color: T.anthracite }}>{item.name}</p>
                      <p style={{ ...sans, fontSize: 11, color: T.taupe }}>{item.type} · {item.time}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button style={{ ...sans, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: T.ivory, border: `1px solid ${T.border}`, color: T.taupe, cursor: "pointer" }}>Ablehnen</button>
                      <button style={{ ...sans, fontSize: 11, padding: "5px 12px", borderRadius: 8, background: T.gold, color: T.white, border: "none", cursor: "pointer" }}>Freigeben</button>
                    </div>
                  </div>
                  <p style={{ ...serif, fontSize: 13, color: T.taupe, fontStyle: "italic" }}>{item.preview}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy settings */}
          <div>
            <Label>Sichtbarkeits-Einstellungen</Label>
            <Card>
              <p style={{ ...serif, fontSize: 18, color: T.anthracite, marginBottom: 16 }}>Abschnitt-Sichtbarkeit</p>
              {[["Biografie", "Öffentlich"], ["Galerie", "Öffentlich"], ["Stammbaum", "Familie"], ["Audio-Erinnerungen", "Familie"], ["Persönliche Briefe", "Privat"]].map(([section, vis]) => (
                <div key={section} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ ...sans, fontSize: 13, color: T.anthracite }}>{section}</span>
                  <select style={{ ...sans, fontSize: 12, padding: "4px 10px", borderRadius: 8, border: `1px solid ${T.border}`, color: T.anthracite, background: T.ivory, cursor: "pointer", outline: "none" }} defaultValue={vis}>
                    <option>Öffentlich</option>
                    <option>Familie</option>
                    <option>Privat</option>
                  </select>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 9. QR & PRODUKTE                                  */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="qr" title="QR-Code & Druckprodukte" subtitle="Physische Erinnerungsprodukte — würdevoll, hochwertig, dauerhaft." bg={T.sand}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>

          {/* QR plaque */}
          <Card>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 12 }}>Grabplakette</p>
            <div style={{ background: `linear-gradient(145deg, #2a2520, #1a1410)`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16, border: `1px solid ${T.champagne}40` }}>
              <p style={{ ...serif, fontSize: 16, color: T.champagne, marginBottom: 4 }}>Maria Müller</p>
              <p style={{ ...sans, fontSize: 10, color: T.taupe, marginBottom: 12 }}>* 1942 · † 2024</p>
              <div style={{ width: 80, height: 80, background: T.white, borderRadius: 8, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={56} style={{ color: T.anthracite }} />
              </div>
              <p style={{ ...sans, fontSize: 9, color: T.taupe }}>evertrace.de/maria-mueller</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ ...serif, fontSize: 20, color: T.anthracite }}>€ 219,–</p>
                <p style={{ ...sans, fontSize: 11, color: T.taupe }}>Edelstahl Premium</p>
              </div>
              <Btn size="sm" variant="primary">Bestellen</Btn>
            </div>
          </Card>

          {/* Trauerkarte */}
          <Card>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 12 }}>Trauerkarte</p>
            <div style={{ background: `linear-gradient(160deg, #1a1410, #0f0e0c)`, borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.6 }}>
                <TreePine size={36} style={{ color: T.champagne }} />
              </div>
              <p style={{ ...serif, fontSize: 15, color: T.ivory, marginBottom: 3 }}>Maria Müller</p>
              <p style={{ ...sans, fontSize: 9, color: T.taupe, marginBottom: 12 }}>* 14.03.1942 · † 03.01.2024</p>
              <p style={{ ...serif, fontSize: 11, color: T.champagne, fontStyle: "italic", lineHeight: 1.8 }}>
                „Was wir lieben, hören wir<br />niemals auf zu lieben."
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ ...serif, fontSize: 20, color: T.anthracite }}>€ 0,89/Stk.</p>
                <p style={{ ...sans, fontSize: 11, color: T.taupe }}>ab 50 Stück</p>
              </div>
              <Btn size="sm" variant="secondary">Gestalten</Btn>
            </div>
          </Card>

          {/* Erinnerungsbuch */}
          <Card>
            <p style={{ ...sans, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 12 }}>Erinnerungsbuch</p>
            <div style={{ height: 130, borderRadius: 14, background: `linear-gradient(160deg, ${T.champagne}, ${T.sand})`, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "-5px 5px 0 rgba(176,123,52,0.25)" }}>
              <div style={{ textAlign: "center" }}>
                <BookOpen size={36} style={{ color: T.anthracite, opacity: 0.5, margin: "0 auto 8px" }} />
                <p style={{ ...serif, fontSize: 13, color: T.anthracite, fontStyle: "italic" }}>Maria Müller</p>
                <p style={{ ...sans, fontSize: 10, color: T.taupe }}>1942 – 2024</p>
              </div>
            </div>
            <p style={{ ...sans, fontSize: 12, color: T.taupe, lineHeight: 1.7, marginBottom: 14 }}>Hardcover A4 · Alle Beiträge & Fotos · KI-layoutet · In Deutschland gedruckt</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ ...serif, fontSize: 20, color: T.anthracite }}>€ 59,–</p>
              <Btn size="sm" variant="primary">Bestellen</Btn>
            </div>
          </Card>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 10. BESTATTER-DASHBOARD                           */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="dashboard" title="Bestatter-Dashboard" subtitle="Professionell, übersichtlich, dunkel und ruhig." bg={T.anthracite}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Case list */}
          <div>
            <Label>Fallübersicht</Label>
            <div style={{ background: "#181714", borderRadius: 20, border: "1px solid #302d28", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #302d28", display: "flex", justifyContent: "space-between" }}>
                <span style={{ ...serif, fontSize: 16, color: T.ivory }}>Aktive Fälle</span>
                <button style={{ ...sans, fontSize: 12, padding: "5px 14px", borderRadius: 8, background: T.gold, color: "#0f0e0c", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={12} /> Neuer Fall
                </button>
              </div>
              {[
                { name: "Ernst Hoffmann", date: "15.03.2024", status: "Karte in Druck", badge: T.gold },
                { name: "Elfriede Braun", date: "08.03.2024", status: "Gedenkseite aktiv", badge: "#4ade80" },
                { name: "Friedrich Maier", date: "02.03.2024", status: "Abgeschlossen", badge: "#5a554e" },
              ].map(c => (
                <div key={c.name} style={{ padding: "14px 20px", borderBottom: "1px solid #302d28", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ ...sans, fontSize: 13, fontWeight: 500, color: T.ivory, marginBottom: 3 }}>{c.name}</p>
                    <p style={{ ...sans, fontSize: 11, color: "#5a554e" }}>† {c.date}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ ...sans, fontSize: 11, color: c.badge, background: `${c.badge}18`, padding: "3px 10px", borderRadius: 100 }}>{c.status}</span>
                    <ChevronRight size={14} style={{ color: "#5a554e" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card wizard preview */}
          <div>
            <Label>Trauerkarten-Wizard</Label>
            <div style={{ background: "#181714", borderRadius: 20, border: "1px solid #302d28", padding: 24 }}>
              {/* Steps */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["Fall", "Angaben", "KI-Vorschau", "Druck", "Bestellen"].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: i < 2 ? T.gold : i === 2 ? "rgba(176,123,52,0.2)" : "#302d28", border: `1px solid ${i <= 2 ? T.gold : "#302d28"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ ...sans, fontSize: 9, color: i < 2 ? "#0f0e0c" : i === 2 ? T.gold : "#5a554e" }}>{i + 1}</span>
                    </div>
                    {i < 4 && <div style={{ width: 12, height: 1, background: i < 2 ? T.gold : "#302d28" }} />}
                  </div>
                ))}
              </div>

              {/* AI text preview */}
              <div style={{ background: "#201e1a", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <p style={{ ...sans, fontSize: 11, color: "#5a554e", marginBottom: 8 }}>KI-generierter Text</p>
                <p style={{ ...serif, fontSize: 14, color: T.champagne, fontStyle: "italic", lineHeight: 1.9 }}>
                  Ernst Hoffmann lebte mit ruhiger Bestimmtheit — ein Mann, dessen Hände ebenso sicher den Spaten wie ein gutes Buch führten. Die Erde, die Natur, die Stille des Waldes: darin fand er seine tiefste Ruhe.
                </p>
              </div>

              {/* Motif preview */}
              <div style={{ height: 80, borderRadius: 12, background: `linear-gradient(160deg, #0f0e0c, #1a1612)`, border: `1px solid ${T.champagne}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <TreePine size={32} style={{ color: T.gold, opacity: 0.6 }} />
              </div>

              <button style={{ width: "100%", ...sans, fontSize: 13, fontWeight: 600, padding: "11px 0", borderRadius: 12, background: T.gold, color: "#0f0e0c", border: "none", cursor: "pointer" }}>
                Weiter zur Druckkonfiguration →
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ */}
      {/* 11. PRIVATER FAMILIENBEREICH                      */}
      {/* ══════════════════════════════════════════════════ */}
      <Section id="mobile" title="Privater Familienbereich & Mobile" subtitle="Der geschützte Bereich für Familie — intim, warm, vertraut.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Private family unlock */}
          <div>
            <Label>Familienbereich — Zugang</Label>
            <Card style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: T.sand, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={28} style={{ color: T.gold }} />
              </div>
              <h3 style={{ ...serif, fontSize: 24, color: T.anthracite, marginBottom: 6 }}>Privater Familienbereich</h3>
              <p style={{ ...sans, fontSize: 13, color: T.taupe, marginBottom: 20, lineHeight: 1.7 }}>Dieser Bereich enthält persönliche Erinnerungen, Stammbaumdaten und private Briefe — nur für Familienmitglieder.</p>
              <InputField placeholder="Familienpasswort eingeben" type="password" />
              <button style={{ width: "100%", marginTop: 14, ...sans, fontSize: 13, fontWeight: 600, padding: "11px 0", borderRadius: 12, background: T.gold, color: T.white, border: "none", cursor: "pointer" }}>
                Eintreten
              </button>
            </Card>
          </div>

          {/* Mobile view */}
          <div>
            <Label>Mobile Ansicht</Label>
            <div style={{ width: 280, margin: "0 auto", background: T.anthracite, borderRadius: 36, padding: "12px 0", boxShadow: `0 20px 60px rgba(47,45,42,0.4)` }}>
              {/* Phone header notch */}
              <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <div style={{ width: 80, height: 6, background: "#302d28", borderRadius: 3 }} />
              </div>
              {/* Screen */}
              <div style={{ margin: "0 10px", background: T.ivory, borderRadius: 26, overflow: "hidden", minHeight: 520 }}>
                {/* Hero mini */}
                <div style={{ height: 160, background: `url(https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=60) center/cover`, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,18,14,0.8), transparent)" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
                    <p style={{ ...serif, fontSize: 20, color: T.ivory }}>Maria Müller</p>
                    <p style={{ ...sans, fontSize: 10, color: T.champagne }}>* 1942 · † 2024</p>
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: "16px 14px" }}>
                  <p style={{ ...sans, fontSize: 9, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase", marginBottom: 8 }}>Lebensgeschichte</p>
                  <p style={{ ...serif, fontSize: 13, color: T.anthracite, fontStyle: "italic", lineHeight: 1.8, marginBottom: 14 }}>
                    Maria wuchs in den Weinbergen der Pfalz auf…
                  </p>
                  {/* Mini tabs */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {["Fotos", "Kerzen", "Beiträge"].map((t, i) => (
                      <button key={t} style={{ ...sans, fontSize: 10, padding: "5px 10px", borderRadius: 8, background: i === 0 ? T.gold : T.sand, color: i === 0 ? T.white : T.taupe, border: "none", cursor: "pointer" }}>{t}</button>
                    ))}
                  </div>
                  {/* Photo grid mini */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ height: 70, borderRadius: 10, background: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60) center/cover` }} />
                    <div style={{ height: 70, borderRadius: 10, background: `url(https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=200&q=60) center/cover` }} />
                  </div>
                </div>
                {/* Bottom nav */}
                <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: `1px solid ${T.border}`, background: T.white }}>
                  {[[Home, "Start"], [Heart, "Kerze"], [BookOpen, "Buch"], [Users, "Familie"]].map(([Icon, label]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <Icon size={16} style={{ color: T.taupe, margin: "0 auto 2px" }} />
                      <p style={{ ...sans, fontSize: 8, color: T.taupe }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ───────────────────────────────────────── */}
      <div style={{ background: T.anthracite, padding: "48px 32px", textAlign: "center" }}>
        <EvertraceLogo size={1} dark={false} />
        <p style={{ ...sans, fontSize: 12, color: "#5a554e", marginTop: 20 }}>
          Evertrace Design System · Stil 2 — Warm & Würdevoll<br />
          Für Familien und Bestatter, die Erinnerungen verdienen.
        </p>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          {["#F7F3ED", "#EDE3D3", "#D8C3A5", "#A89A8A", "#2F2D2A", "#B07B34", "#7A3142"].map(c => (
            <div key={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper icon (not in lucide)
function LayoutIcon({ size = 16, style }) {
  return <BarChart3 size={size} style={style} />;
}