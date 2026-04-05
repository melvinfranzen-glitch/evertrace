import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

import { sanitizePromptInput } from "@/utils/sanitize";
import { Plus, Loader2, BookOpen, X, Check, ChevronLeft, Minus, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemorialCard from "@/components/memorial/MemorialCard";
import AnniversaryReminders from "@/components/dashboard/AnniversaryReminders";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-8" style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} className="flex-shrink-0 transition-all"
          style={{
            background: active === t.id ? "rgba(201,169,110,0.12)" : "white",
            border: `1px solid ${active === t.id ? "rgba(201,169,110,0.4)" : "#e5e7eb"}`,
            color: active === t.id ? "#c9a96e" : "#6b7280",
            borderRadius: 24, padding: "9px 22px", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StepDots({ steps, current }) {
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: i < current ? "#c9a96e" : i === current ? "rgba(201,169,110,0.15)" : "#f3f4f6", color: i <= current ? "#c9a96e" : "#9ca3af", border: `1px solid ${i <= current ? "#c9a96e" : "#e5e7eb"}` }}>
              {i < current ? <Check className="w-3 h-3" style={{ color: "#0f0e0c" }} /> : i + 1}
            </div>
            <span className="text-xs hidden sm:block" style={{ color: i === current ? "#c9a96e" : "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-5 h-px" style={{ background: i < current ? "#c9a96e" : "#e5e7eb" }} />}
        </div>
      ))}
    </div>
  );
}

function AddressForm({ addr, setAddr }) {
  const f = (k, v) => setAddr(p => ({ ...p, [k]: v }));
  const inp = { background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, padding: "10px 14px", color: "#2c2419", fontFamily: "'DM Sans', sans-serif", width: "100%", outline: "none", fontSize: 13 };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={addr.firstName || ""} onChange={e => f("firstName", e.target.value)} placeholder="Vorname *" style={inp} />
        <input value={addr.lastName || ""} onChange={e => f("lastName", e.target.value)} placeholder="Nachname *" style={inp} />
      </div>
      <input value={addr.street || ""} onChange={e => f("street", e.target.value)} placeholder="Straße & Hausnummer *" style={{ ...inp }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={addr.zip || ""} onChange={e => f("zip", e.target.value)} placeholder="PLZ *" style={inp} />
        <input value={addr.city || ""} onChange={e => f("city", e.target.value)} placeholder="Ort *" style={inp} />
      </div>
      <input type="email" value={addr.email || ""} onChange={e => f("email", e.target.value)} placeholder="E-Mail für Versandbestätigung *" style={inp} />
    </div>
  );
}

function addrValid(a) {
  return a.firstName && a.lastName && a.street && a.zip && a.city && a.email;
}

function SkeletonPulse({ h = 20, w = "100%", rounded = 8 }) {
  return <div className="animate-pulse" style={{ height: h, width: w, background: "#ede8df", borderRadius: rounded }} />;
}

function ConfirmSuccess({ title, sub, btnLabel, onReset }) {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-5">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(201,169,110,0.15)", border: "1.5px solid #c9a96e" }}>
        <Check className="w-7 h-7" style={{ color: "#c9a96e" }} />
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#1c1917", fontWeight: 600 }}>{title}</h2>
      <p className="text-sm leading-relaxed" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>
      <button onClick={onReset} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
        {btnLabel}
      </button>
    </div>
  );
}

// ─── PLAQUE MODAL ─────────────────────────────────────────────────────────────

const PLAQUE_PRODUCTS = [
  { id: "plaque_aluminium", label: "Aluminium-Plakette", desc: "Gebürstetes Aluminium, Lasergravur, wetterfest — 20 × 11 cm", price: 129, badge: null },
  { id: "plaque_slate", label: "Schiefer-Plakette", desc: "Naturschiefer, Lasergravur, zeitlos — 20 × 11 cm", price: 149, badge: null },
  { id: "plaque_steel", label: "Edelstahl Premium", desc: "Edelstahl gebürstet, Tiefengravur, UV-Schutz, Montageset — 20 × 11 cm", price: 219, badge: "Bestseller" },
];

function PlaqueModal({ memorial, onClose }) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState(PLAQUE_PRODUCTS[0]);
  const [engravingText, setEngravingText] = useState("");
  const [addr, setAddr] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const memorialUrl = `${window.location.origin}/MemorialProfile?id=${memorial.short_id}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(memorialUrl)}`;

  const submit = async () => {
    if (!addrValid(addr)) return;
    setSaving(true);
    await base44.entities.Order.create({
      product_type: "memorial_plaque",
      memorial_id: memorial.id,
      plaque_type: product.id,
      engraving_text: engravingText,
      qr_memorial_url: memorialUrl,
      customer_name: `${addr.firstName} ${addr.lastName}`,
      customer_email: addr.email,
      shipping_street: addr.street,
      shipping_city: addr.city,
      shipping_zip: addr.zip,
      notes: JSON.stringify(addr),
      price: product.price,
      status: "pending",
    });
    setSaving(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full overflow-hidden overflow-y-auto" style={{ maxWidth: 560, maxHeight: "90vh", background: "#FAFAF8", borderRadius: 16 }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: "#FAFAF8", borderColor: "#e8dfd0" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#1c1917", fontWeight: 600 }}>
            Grabplakette · {memorial.name}
          </p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <ConfirmSuccess
              title="Bestellung aufgenommen"
              sub="Ihre Plakette wird mit dem personalisierten QR-Code gefertigt und innerhalb von 7–10 Werktagen geliefert. Der QR-Code bleibt dauerhaft aktiv, solange die Gedenkseite besteht."
              btnLabel="Schließen"
              onReset={onClose}
            />
          ) : (
            <>
              <StepDots steps={["Plakette wählen", "QR-Code prüfen", "Bestellen"]} current={step} />

              {/* Step 0 */}
              {step === 0 && (
                <div>
                  <div className="space-y-3 mb-6">
                    {PLAQUE_PRODUCTS.map(p => (
                      <div key={p.id} onClick={() => setProduct(p)} className="cursor-pointer p-5 rounded-xl flex items-center gap-4 transition-all"
                        style={{ border: `1.5px solid ${product.id === p.id ? "#c9a96e" : "#e5e7eb"}`, background: product.id === p.id ? "rgba(201,169,110,0.03)" : "white" }}>
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ border: `2px solid ${product.id === p.id ? "#c9a96e" : "#d1d5db"}`, background: product.id === p.id ? "#c9a96e" : "white" }}>
                          {product.id === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-800">{p.label}</span>
                            {p.badge && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}>{p.badge}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                        </div>
                        <p className="font-bold text-gray-800 flex-shrink-0">€ {p.price},–</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl font-medium text-sm"
                    style={{ background: "#c9a96e", color: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
                    Weiter →
                  </button>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="rounded-xl p-6 flex gap-5 mb-5" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0" }}>
                    <img src={qrSrc} alt="QR" className="w-24 h-24 rounded-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#1c1917", fontWeight: 600 }} className="mb-1">{memorial.name}</p>
                      <p className="text-sm mb-1" style={{ color: "#5a554e", fontFamily: "'DM Sans', sans-serif" }}>Dieser QR-Code wird dauerhaft auf Ihrer Plakette graviert.</p>
                      <p className="font-mono text-xs break-all mb-2" style={{ color: "#c9a96e" }}>{memorialUrl}</p>
                      <p className="text-xs" style={{ color: "#8a8278" }}>Besucher scannen direkt am Grab und gelangen sofort zur Gedenkseite.</p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gravurtext (optional)</label>
                    <div className="relative">
                      <input value={engravingText} onChange={e => setEngravingText(e.target.value.slice(0, 40))}
                        placeholder="»In liebevoller Erinnerung«"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none"
                        style={{ background: "white" }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{engravingText.length} / 40</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                      <ChevronLeft className="w-4 h-4" /> Zurück
                    </button>
                    <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                      Weiter zur Bestellung →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="rounded-xl p-5 mb-5" style={{ background: "white", border: "1px solid #e8dfd0" }}>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{product.label} · € {product.price},–</p>
                    <p className="text-xs text-gray-500 mb-1">Gedenkseite: {memorial.name}</p>
                    {engravingText && <p className="text-xs text-gray-500">Gravur: „{engravingText}"</p>}
                    <p className="font-mono text-xs mt-1" style={{ color: "#c9a96e" }}>QR → {memorialUrl}</p>
                  </div>
                  <div className="mb-5">
                    <AddressForm addr={addr} setAddr={setAddr} />
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#2c2419", fontWeight: 600 }}>€ {product.price},–</p>
                  <p className="text-xs mb-4" style={{ color: "#8a8278" }}>inkl. Versand & Gravur · Lieferzeit 7–10 Werktage</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border sm:w-auto" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                      <ChevronLeft className="w-4 h-4" /> Zurück
                    </button>
                    <button onClick={submit} disabled={saving || !addrValid(addr)} className="flex-1 flex items-center justify-center disabled:opacity-50"
                      style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
                      {saving ? "Wird bestellt…" : "Plakette jetzt bestellen"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: TRAUERKARTEN ─────────────────────────────────────────────────────

const PASSIONS = ["Familie", "Natur & Garten", "Musik", "Reisen", "Handwerk", "Tiere", "Glaube & Spiritualität", "Kochen & Backen", "Sport", "Kunst"];
const TONES = ["Förmlich & würdevoll", "Warm & persönlich", "Poetisch & lyrisch"];
const FORMATS = ["DIN A6 quer", "DIN lang", "DIN A5 gefaltet", "Leporello"];
const PRINT_TIERS = [
  { id: "standard", label: "Standard", desc: "300g Mattkunstdruck", delivery: "3–4 Werktage", unit: 0.99, shipping: 6.90 },
  { id: "premium", label: "Premium", desc: "Soft-Touch-Laminierung", delivery: "2–3 Werktage", unit: 1.49, shipping: 8.90 },
  { id: "express", label: "Express", desc: "Expresslieferung nächster Werktag", delivery: "1 Werktag", unit: 2.29, shipping: 16.90 },
];

function CardTab({ memorials }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName: "", lastName: "", birthDate: "", deathDate: "", character: "", passions: [], quote: "", tone: TONES[1], format: FORMATS[0] });
  const [generatedText, setGeneratedText] = useState("");
  const [motifUrl, setMotifUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [addonInvite, setAddonInvite] = useState(false);
  const [addonThanks, setAddonThanks] = useState(false);
  const [addonQr, setAddonQr] = useState(false);
  const [cardFace, setCardFace] = useState("front");
  const [qty, setQty] = useState(50);
  const [tier, setTier] = useState(PRINT_TIERS[0]);
  const [addr, setAddr] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [prefillId, setPrefillId] = useState("");

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togglePassion = (p) => setForm(f => ({ ...f, passions: f.passions.includes(p) ? f.passions.filter(x => x !== p) : [...f.passions, p] }));

  const prefillFromMemorial = (id) => {
    const m = memorials.find(x => x.id === id);
    if (!m) return;
    setF("firstName", m.name?.split(" ")[0] || "");
    setF("lastName", m.name?.split(" ").slice(1).join(" ") || "");
    setF("birthDate", m.birth_date || "");
    setF("deathDate", m.death_date || "");
    setF("character", m.biography_raw_input || "");
    setF("quote", m.subtitle || "");
  };

  const canAdvance0 = form.firstName && form.lastName && form.deathDate;

  const generate = async () => {
    setGenerating(true);
    setGeneratedText("");
    setMotifUrl("");
    const name = `${form.firstName} ${form.lastName}`;
    const [textResult, imgResult] = await Promise.all([
      base44.integrations.Core.InvokeLLM({
        prompt: `Du bist Experte für würdevolle Trauerkarten auf Deutsch. Erstelle einen personalisierten Trauerkartentext in drei Teilen ohne Überschriften: erstens ein eröffnender Satz der den Charakter der Person präzise einfängt, zweitens zwei bis drei Zeilen die ihre Leidenschaften und ihr Leben verweben, drittens eine abschließende Zeile die das angegebene Zitat integriert oder einen würdigen Ersatz setzt falls kein Zitat angegeben wurde. Gesamtlänge 80 bis 110 Wörter. Name: ${name}, Charakter: ${sanitizePromptInput(form.character || "freundlich und hilfsbereit")}, Leidenschaften: ${form.passions.join(", ") || "das Leben"}, Zitat: ${sanitizePromptInput(form.quote || "")}, Ton: ${form.tone}.`,
      }),
      base44.integrations.Core.GenerateImage({
        prompt: `Minimalist memorial card front cover illustration. Dark background (#0f0e0c), single symbolic gold line motif (#c9a96e), no text, no faces, no people. Theme: ${form.tone} and ${form.passions.slice(0, 2).join(", ") || "nature"}. Ultra-minimal, sophisticated, print-ready.`,
      }),
    ]);
    setGeneratedText(typeof textResult === "string" ? textResult : JSON.stringify(textResult));
    setMotifUrl(imgResult?.url || "");
    setGenerating(false);
  };

  const goToStep1 = async () => {
    setStep(1);
    await generate();
  };

  const addonPerUnit = (addonInvite ? 0.59 : 0) + (addonThanks ? 0.59 : 0);
  const totalPrice = (qty * (tier.unit + addonPerUnit) + tier.shipping).toFixed(2);

  const submitOrder = async () => {
    if (!addrValid(addr)) return;
    setSaving(true);
    await base44.entities.PrintOrder.create({
      order_type: "Trauerkarte",
      quantity: qty,
      print_tier: tier.id,
      unit_price: tier.unit,
      total_price: parseFloat(totalPrice),
      addon_invitation: addonInvite,
      addon_thankyou: addonThanks,
      addon_qr: addonQr,
      generated_text: generatedText,
      motif_image_url: motifUrl,
      card_format: form.format,
      delivery_name: `${addr.firstName} ${addr.lastName}`,
      delivery_street: addr.street,
      delivery_city: addr.city,
      delivery_zip: addr.zip,
      customer_notification_email: addr.email,
      status: "In Bearbeitung",
    });
    setSaving(false);
    setDone(true);
  };

  const reset = () => { setDone(false); setStep(0); setForm({ firstName: "", lastName: "", birthDate: "", deathDate: "", character: "", passions: [], quote: "", tone: TONES[1], format: FORMATS[0] }); setGeneratedText(""); setMotifUrl(""); setAddr({}); };

  if (done) return (
    <>
      <ConfirmSuccess
        title="Bestellung aufgenommen"
        sub="Ihre personalisierten Trauerkarten werden gedruckt und innerhalb der gewählten Lieferzeit an die angegebene Adresse gesendet."
        btnLabel="Neue Karte erstellen"
        onReset={reset}
      />
    </>
  );

  const inpStyle = { background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", color: "#2c2419", fontFamily: "'DM Sans', sans-serif", width: "100%", outline: "none", fontSize: 13 };

  return (
    <div>
      <StepDots steps={["Angaben", "Text & Motiv", "Drucken"]} current={step} />

      {/* Step 0 */}
      {step === 0 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#1c1917", fontWeight: 600 }} className="mb-6">Trauerkarte gestalten</h2>

          {memorials.length > 0 && (
            <div className="mb-5 p-4 rounded-xl" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>Aus einer Gedenkseite übernehmen</label>
              <select value={prefillId} onChange={e => { setPrefillId(e.target.value); prefillFromMemorial(e.target.value); }}
                className="w-full rounded-lg text-sm outline-none" style={{ ...inpStyle, background: "white" }}>
                <option value="">— Bitte wählen —</option>
                {memorials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Vorname *</label>
                <input value={form.firstName} onChange={e => setF("firstName", e.target.value)} placeholder="z. B. Maria" style={inpStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Nachname *</label>
                <input value={form.lastName} onChange={e => setF("lastName", e.target.value)} placeholder="z. B. Müller" style={inpStyle} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Geburtsdatum</label>
                <input type="date" value={form.birthDate} onChange={e => setF("birthDate", e.target.value)} style={inpStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Sterbedatum *</label>
                <input type="date" value={form.deathDate} onChange={e => setF("deathDate", e.target.value)} style={inpStyle} />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Charakterbeschreibung</label>
              <textarea value={form.character} onChange={e => setF("character", e.target.value)} rows={3}
                placeholder="Z. B. Ein ruhiger Mensch, der immer für andere da war…"
                style={{ ...inpStyle, resize: "none" }} />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: "#8a8278" }}>Leidenschaften & Interessen</label>
              <div className="flex flex-wrap gap-2">
                {PASSIONS.map(p => (
                  <button key={p} onClick={() => togglePassion(p)} className="transition-all"
                    style={{ background: form.passions.includes(p) ? "rgba(201,169,110,0.12)" : "white", border: `1px solid ${form.passions.includes(p) ? "#c9a96e" : "#e5e7eb"}`, color: form.passions.includes(p) ? "#c9a96e" : "#6b7280", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#8a8278" }}>Lieblingszitat oder Spruch</label>
              <input value={form.quote} onChange={e => setF("quote", e.target.value)} placeholder="z. B. »Das Beste, was wir hinterlassen, sind Erinnerungen.«" style={inpStyle} />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: "#8a8278" }}>Ton der Karte</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button key={t} onClick={() => setF("tone", t)}
                    style={{ background: form.tone === t ? "rgba(201,169,110,0.12)" : "white", border: `1px solid ${form.tone === t ? "#c9a96e" : "#e5e7eb"}`, color: form.tone === t ? "#c9a96e" : "#6b7280", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: "#8a8278" }}>Kartenformat</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <button key={f} onClick={() => setF("format", f)}
                    style={{ background: form.format === f ? "rgba(201,169,110,0.08)" : "white", border: `1.5px solid ${form.format === f ? "#c9a96e" : "#e5e7eb"}`, color: form.format === f ? "#c9a96e" : "#6b7280", borderRadius: 10, padding: "10px 8px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "center" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={goToStep1} disabled={!canAdvance0}
              className="px-7 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ background: "#c9a96e", color: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
              Weiter → Text erstellen
            </button>
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: card preview */}
            <div>
              <div className="flex gap-2 mb-3">
                {["front", "inside"].map(f => (
                  <button key={f} onClick={() => setCardFace(f)}
                    style={{ background: cardFace === f ? "rgba(201,169,110,0.12)" : "white", border: `1px solid ${cardFace === f ? "#c9a96e" : "#e5e7eb"}`, color: cardFace === f ? "#c9a96e" : "#6b7280", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                    {f === "front" ? "Außen" : "Innen"}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: cardFace === "front" ? "#0f0e0c" : "white", minHeight: 200, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid #e8dfd0" }}>
                {cardFace === "front" ? (
                  <div className="text-center">
                    {motifUrl ? <img src={motifUrl} alt="Motiv" className="w-32 h-44 rounded-lg object-cover mx-auto mb-3" /> : generating ? <SkeletonPulse h={176} w={128} rounded={8} /> : null}
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8", fontSize: 17, fontWeight: 600 }}>{form.firstName} {form.lastName}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#c9a96e", fontSize: 11 }}>{form.birthDate || ""}{form.birthDate && form.deathDate ? " · " : ""}{form.deathDate || ""}</p>
                  </div>
                ) : (
                  <div className="w-full">
                    {generating ? (
                      <div className="space-y-2"><SkeletonPulse h={14} /><SkeletonPulse h={14} w="90%" /><SkeletonPulse h={14} w="80%" /><SkeletonPulse h={14} w="95%" /></div>
                    ) : (
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, lineHeight: 1.9, color: "#2c2419", fontStyle: "italic" }}>{generatedText}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Addons */}
              <div className="mt-4 space-y-2">
                {[
                  { label: "Einladungskarte", price: "+€ 0,59 / Stk.", val: addonInvite, set: setAddonInvite },
                  { label: "Danksagungskarte", price: "+€ 0,59 / Stk.", val: addonThanks, set: setAddonThanks },
                  ...(memorials.length > 0 ? [{ label: "QR-Code zur Gedenkseite", price: "kostenlos", val: addonQr, set: setAddonQr }] : []),
                ].map((a, i) => (
                  <div key={i} onClick={() => a.set(v => !v)} className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                    style={{ border: `1px solid ${a.val ? "#c9a96e" : "#e5e7eb"}`, background: a.val ? "rgba(201,169,110,0.05)" : "white" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center" style={{ border: `2px solid ${a.val ? "#c9a96e" : "#d1d5db"}`, background: a.val ? "#c9a96e" : "white" }}>
                        {a.val && <Check className="w-2.5 h-2.5" style={{ color: "white" }} />}
                      </div>
                      <span className="text-sm" style={{ color: "#2c2419", fontFamily: "'DM Sans', sans-serif" }}>{a.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#8a8278" }}>{a.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: editable text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Kartentext</label>
                <button onClick={generate} disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border disabled:opacity-50"
                  style={{ borderColor: "rgba(201,169,110,0.4)", color: "#c9a96e", background: "white" }}>
                  <RefreshCw className="w-3 h-3" /> Neu formulieren
                </button>
              </div>
              {generating ? (
                <div className="space-y-2 p-4 rounded-xl" style={{ background: "#fafaf8", border: "1px solid #e8dfd0" }}>
                  <SkeletonPulse /><SkeletonPulse w="88%" /><SkeletonPulse w="92%" /><SkeletonPulse w="75%" /><SkeletonPulse w="85%" />
                </div>
              ) : (
                <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} rows={10}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, lineHeight: 1.9, color: "#2c2419", background: "#fafaf8", border: "1px solid #e8dfd0", borderRadius: 8, padding: 16, width: "100%", outline: "none", resize: "none" }} />
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              Weiter zur Bestellung →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#1c1917", fontWeight: 600 }} className="mb-5">Drucken & Bestellen</h2>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-gray-600">Anzahl:</span>
            <button onClick={() => setQty(q => Math.max(25, q - 25))} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: "#e5e7eb" }}><Minus className="w-3.5 h-3.5 text-gray-500" /></button>
            <input type="number" value={qty} onChange={e => setQty(Math.max(25, parseInt(e.target.value) || 25))}
              className="w-16 text-center py-2 rounded-lg border text-sm font-semibold outline-none" style={{ borderColor: "#c9a96e", color: "#2c2419" }} />
            <button onClick={() => setQty(q => q + 25)} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: "#e5e7eb" }}><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
            <span className="text-xs text-gray-400">(mind. 25)</span>
          </div>

          {/* Tiers */}
          <div className="space-y-3 mb-6">
            {PRINT_TIERS.map(t => (
              <div key={t.id} onClick={() => setTier(t)} className="cursor-pointer p-4 rounded-xl flex items-center gap-4 transition-all"
                style={{ border: `1.5px solid ${tier.id === t.id ? "#c9a96e" : "#e5e7eb"}`, background: tier.id === t.id ? "rgba(201,169,110,0.04)" : "white" }}>
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ border: `2px solid ${tier.id === t.id ? "#c9a96e" : "#d1d5db"}`, background: tier.id === t.id ? "#c9a96e" : "white" }}>
                  {tier.id === t.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc} · {t.delivery}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-800">€ {t.unit.toFixed(2)} / Stk.</p>
                  <p className="text-xs text-gray-500">Gesamt € {(qty * t.unit).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mb-5">Versand: € {tier.shipping.toFixed(2)}</p>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#2c2419", fontWeight: 600 }}>€ {totalPrice}</div>
          <p className="text-xs mb-4" style={{ color: "#8a8278" }}>zzgl. MwSt.</p>

          <div className="mb-5">
            <AddressForm addr={addr} setAddr={setAddr} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border sm:w-auto" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={submitOrder} disabled={saving || !addrValid(addr)} className="flex-1 flex items-center justify-center disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
              {saving ? "Wird bestellt…" : "Trauerkarte bestellen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: LEBENSGESCHICHTEN-BUCH ────────────────────────────────────────────

function getUnitPrice(qty) { return qty >= 5 ? 39 : qty >= 2 ? 49 : 59; }

function BookTab({ memorials }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [addr, setAddr] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const unit = getUnitPrice(qty);
  const total = qty * unit;

  const ready = selected && !!(selected.biography?.trim()) && !!(selected.gallery_images?.length > 0);
  const missBio = selected && !selected.biography?.trim();
  const missPhotos = selected && !(selected.gallery_images?.length > 0);

  const submit = async () => {
    if (!addrValid(addr)) return;
    setSaving(true);
    await base44.entities.Order.create({
      product_type: "life_book",
      memorial_id: selected.id,
      quantity: qty,
      notes: JSON.stringify({ ...addr, unit_price: unit }),
      customer_name: `${addr.firstName} ${addr.lastName}`,
      customer_email: addr.email,
      shipping_street: addr.street,
      shipping_city: addr.city,
      shipping_zip: addr.zip,
      price: total,
      status: "pending",
    });
    setSaving(false);
    setDone(true);
  };

  if (done) return (
    <div>
      <ConfirmSuccess
        title="Bestellung aufgenommen"
        sub="Wir generieren Ihr persönliches Lebensgeschichten-Buch aus den Inhalten der Gedenkseite und lassen es in Deutschland drucken. Lieferzeit: 7–10 Werktage. Sie erhalten eine Versandbestätigung per E-Mail."
        btnLabel="Weiteres Buch bestellen"
        onReset={() => { setDone(false); setStep(0); setSelected(null); setQty(1); setAddr({}); }}
      />
    </div>
  );

  return (
    <div>
      {/* Step 0 */}
      {step === 0 && (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#1c1917", fontWeight: 600 }} className="mb-2">
            Für wen möchten Sie ein Buch erstellen?
          </h2>
          <p className="text-sm mb-7" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>
            Das Lebensgeschichten-Buch wird aus den Inhalten Ihrer Gedenkseite generiert — Biografie, Fotos, Timeline und Lebenswerk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {memorials.map(m => {
              const isSel = selected?.id === m.id;
              return (
                <div key={m.id} onClick={() => setSelected(m)} className="cursor-pointer transition-all rounded-xl p-4"
                  style={{ background: isSel ? "rgba(201,169,110,0.04)" : "white", border: `1px solid ${isSel ? "#c9a96e" : "#e5e7eb"}`, borderRadius: 12 }}>
                  <div className="flex items-center gap-3 mb-2">
                    {m.hero_image_url
                      ? <img src={m.hero_image_url} alt={m.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold"
                          style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>
                          {m.name?.[0]}
                        </div>
                    }
                    <div>
                      <p className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#1c1917" }}>{m.name}</p>
                      {m.death_date && <p className="text-xs" style={{ color: "#8a8278" }}>† {m.death_date}</p>}
                    </div>
                  </div>
                  {isSel && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.biography?.trim() ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {m.biography?.trim() ? "✓ Biografie" : "Biografie fehlt"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.gallery_images?.length > 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {m.gallery_images?.length > 0 ? "✓ Fotos" : "Fotos fehlen"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="flex flex-wrap items-center gap-3">
              {ready && (
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  Buch gestalten →
                </button>
              )}
              {missBio && (
                <button onClick={() => navigate(createPageUrl("EditMemorial") + `?id=${selected.id}&tab=bio`)}
                  className="px-5 py-2.5 rounded-xl text-sm border" style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
                  Biografie hinzufügen →
                </button>
              )}
              {missPhotos && (
                <button onClick={() => navigate(createPageUrl("EditMemorial") + `?id=${selected.id}&tab=media`)}
                  className="px-5 py-2.5 rounded-xl text-sm border" style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
                  Fotos hinzufügen →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && selected && (
        <div>
          <StepDots steps={["Gedenkseite", "Buch bestellen"]} current={1} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#1c1917", fontWeight: 600 }} className="mb-7">Ihr Lebensgeschichten-Buch</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
            {/* Book mockup */}
            <div>
              <div style={{ background: "linear-gradient(160deg, #f7f3ed, #ede8df)", border: "1px solid #d4c9b0", borderRadius: "6px 10px 10px 6px", padding: "32px 24px 32px 28px", boxShadow: "-5px 5px 0 #c9a96e, -10px 10px 0 rgba(201,169,110,0.25)" }}>
                <div className="flex flex-col items-center text-center">
                  {selected.hero_image_url
                    ? <img src={selected.hero_image_url} alt="" className="w-16 h-16 rounded-full object-cover mb-3" />
                    : <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-2xl font-semibold"
                        style={{ background: "rgba(201,169,110,0.2)", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{selected.name?.[0]}</div>
                  }
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", color: "#2c2419", fontWeight: 600 }} className="mb-1">{selected.name}</p>
                  <p className="text-xs mb-4" style={{ color: "#8a8278" }}>{selected.birth_date?.slice(0, 4)}{selected.birth_date && selected.death_date ? " – " : ""}{selected.death_date?.slice(0, 4)}</p>
                  <div className="w-full h-px mb-3" style={{ background: "#c9a96e", opacity: 0.35 }} />
                  {[...Array(3)].map((_, i) => <div key={i} className="w-full h-2 rounded-full mb-1.5" style={{ background: "#c0b9ae", width: `${82 - i * 10}%` }} />)}
                </div>
              </div>
              <ul className="mt-5 space-y-1.5">
                {["Aus Ihren Einträgen entsteht eine persönliche Lebensgeschichte", "Alle Fotos in würdevollem Layout", "Hardcover Soft-Touch · A4 · Gedruckt in Deutschland"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: "#c9a96e" }}>·</span>{f}
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-3" style={{ color: "#8a8278" }}>
                {selected.gallery_images?.length || 0} Fotos · {selected.biography?.split(" ").length || 0} Wörter Biografie
              </p>
            </div>

            {/* Config */}
            <div>
              <div className="space-y-2 mb-5">
                {[{ label: "1 Exemplar", min: 1, max: 1, unit: 59 }, { label: "2–4 Exemplare", min: 2, max: 4, unit: 49 }, { label: "5 oder mehr Exemplare", min: 5, max: 999, unit: 39 }].map(t => {
                  const active = qty >= t.min && qty <= t.max;
                  return (
                    <div key={t.label} className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                      style={{ border: `1px solid ${active ? "#c9a96e" : "#e5e7eb"}`, background: active ? "rgba(201,169,110,0.08)" : "white" }}>
                      <span className="text-sm" style={{ color: active ? "#c9a96e" : "#6b7280" }}>{t.label}</span>
                      <span className="text-sm font-semibold" style={{ color: active ? "#c9a96e" : "#6b7280" }}>€ {t.unit},– / Stk.</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{ borderColor: "#e5e7eb" }}><Minus className="w-4 h-4 text-gray-500" /></button>
                <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 rounded-lg border text-sm font-semibold outline-none" style={{ borderColor: "#c9a96e", color: "#2c2419" }} />
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-lg border flex items-center justify-center" style={{ borderColor: "#e5e7eb" }}><Plus className="w-4 h-4 text-gray-500" /></button>
                <span className="text-sm text-gray-500">Exemplare</span>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#2c2419", fontWeight: 600 }}>€ {total},–</p>
              <p className="text-xs mb-6" style={{ color: "#8a8278" }}>inkl. Versand · Lieferzeit 7–10 Werktage</p>

              <AddressForm addr={addr} setAddr={setAddr} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStep(0)} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border sm:w-auto" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={submit} disabled={saving || !addrValid(addr)} className="flex-1 flex items-center justify-center disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
              {saving ? "Wird bestellt…" : "Lebensgeschichten-Buch bestellen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plaqueMemorial, setPlaqueMemorial] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const urlTab = urlParams.get("tab");
  const urlMemorialId = urlParams.get("memorial_id");

  const [activeTab, setActiveTab] = useState(
    urlTab === "cards" ? "cards" : urlTab === "book" ? "book" : "memorials"
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    setActiveTab(tab === "cards" ? "cards" : tab === "book" ? "book" : "memorials");
  }, [location.search]);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin(createPageUrl("Dashboard")); return; }
      setUser(u);
      const data = await base44.entities.Memorial.filter({ created_by: u.email }, "-created_date");
      setMemorials(data);
      // If plaque param set, open modal
      if (urlMemorialId) {
        // wait for memorials to be available via state update
        setPlaqueMemorial(data.find(m => m.short_id === urlMemorialId) || null);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#c9a96e" }} />
      </div>
    );
  }

  const hour = new Date().getHours();
  const firstName = user?.full_name?.split(" ")[0] || user?.email || "";
  const greeting = hour < 12 ? `Guten Morgen, ${firstName}.` : hour < 17 ? `Guten Tag, ${firstName}.` : `Guten Abend, ${firstName}.`;

  const TABS = [
    { id: "memorials", label: "Gedenkseiten" },
    { id: "cards", label: "Trauerkarten" },
    { id: "book", label: "Lebensgeschichten-Buch" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7">
          <div>
            <h1 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: "#2c2419" }}>
              Meine Erinnerungsorte
            </h1>
            <p className="mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b7280" }}>
              {greeting}
            </p>

          </div>
          <button
            onClick={() => navigate(createPageUrl("CreateMemorial"))}
            style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            ＋ Neue Gedenkseite erstellen
          </button>
        </div>

        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* Tab 1 */}
        {activeTab === "memorials" && (
          <>
            <AnniversaryReminders memorials={memorials} />
            {memorials.length === 0 ? (
              <div className="px-0 sm:px-0">
                <div className="rounded-2xl text-center"
                  style={{ background: "linear-gradient(160deg, #fdf9f3, #faf5ec)", border: "1px solid #e8dfd0", padding: "40px 32px" }}>
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
                    style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#c9a96e", lineHeight: 1 }}>✦</span>
                  </div>
                  <h2 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#2c2419", fontWeight: 600 }}>
                    Ein Ort der Erinnerung, der bleibt.
                  </h2>
                  <p className="mb-8 max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6b5a44" }}>
                    Hier entstehen digitale Gedenkseiten für Menschen, die uns verlassen haben — mit ihrer Geschichte, ihren Fotos und den Worten derer, die sie liebten.
                  </p>
                  <button
                    onClick={() => navigate(createPageUrl("CreateMemorial"))}
                    style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, border: "none", cursor: "pointer" }}
                  >
                    Jetzt Gedenkseite erstellen
                  </button>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-7">
                    {["Kostenlos", "Einfach zu bedienen", "In wenigen Minuten fertig"].map(t => (
                      <div key={t} className="flex items-center gap-1.5">
                        <span style={{ color: "#c9a96e", fontSize: 10 }}>●</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a8278" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {memorials.map((m) => (
                  <MemorialCard key={m.id} memorial={m}
                    onDelete={(id) => setMemorials(p => p.filter(x => x.id !== id))}
                    onOpenPlaque={(memorial) => setPlaqueMemorial(memorial)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab 2 */}
        {activeTab === "cards" && <CardTab memorials={memorials} />}

        {/* Tab 3 */}
        {activeTab === "book" && <BookTab memorials={memorials} />}
      </div>

      {/* Plaque modal */}
      {plaqueMemorial && (
        <PlaqueModal memorial={plaqueMemorial} onClose={() => setPlaqueMemorial(null)} />
      )}
    </div>
  );
}