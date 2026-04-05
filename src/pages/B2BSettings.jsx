import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { useB2BBranding } from "@/contexts/B2BBrandingContext";
import { Upload, Loader2, Check, Save, Users, Building2, Palette, Eye } from "lucide-react";

const ACCENT_COLORS = [
  { id: "#c9a96e", name: "Antikgold" },
  { id: "#6b8f71", name: "Salbeigrün" },
  { id: "#4a7fa5", name: "Stahlblau" },
  { id: "#b06040", name: "Terrakotta" },
  { id: "#9b8ec4", name: "Lavendel" },
  { id: "#5a5a5a", name: "Anthrazit" },
  { id: "#1a1a1a", name: "Schwarz" },
];

const TABS = [
  { id: "whitelabel", label: "White-Label", icon: Palette },
  { id: "account", label: "Konto & Team", icon: Building2 },
  { id: "plan", label: "Tarif & Abrechnung", icon: Users },
];

import { B2B_PLANS, getPlanLimits } from "@/components/pricing/pricingData";

const PLAN_META = {
  free:       { name: "Free",       limits: "3 Fälle/Monat · 3 Karten · 1 Gedenkseite",              price: "€ 0 / Monat" },
  starter:    { name: "Starter",    limits: "15 Fälle/Monat · 20 Karten · Unbegrenzte Gedenkseiten", price: "€ 39 / Monat" },
  premium:    { name: "Premium",    limits: "50 Fälle/Monat · 75 Karten · Unbegrenzte Gedenkseiten", price: "€ 99 / Monat" },
  enterprise: { name: "Enterprise", limits: "Unbegrenzt · Custom Subdomain · API",                   price: "Ab € 299 / Monat" },
};

export default function B2BSettings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("whitelabel");
  const [home, setHome] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(([h]) => {
        if (!h) { navigate("/B2BRegister"); return; }
        setHome(h); setForm(h);
      });
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!home?.id) {
      setSaveError("Konto nicht geladen. Bitte Seite neu laden.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const { id, created_date, updated_date, created_by, ...updateData } = form;
      await base44.entities.FuneralHome.update(home.id, updateData);
      setHome({ ...home, ...updateData });
      if (updateBranding) {
        updateBranding({
          name: updateData.name,
          tagline: updateData.tagline,
          logo_url: updateData.logo_url,
          accent_color: updateData.accent_color,
          whitelabel_enabled: updateData.whitelabel_enabled,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err?.message || "Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  };

  const accent = form.accent_color || "#c9a96e";
  const plan = PLAN_META[form.plan] || PLAN_META.free;
  const limits = getPlanLimits(form.plan || "free");

  const { branding, updateBranding } = useB2BBranding() || {};
  const contextAccent = branding?.accent_color || accent;

  return (
    <B2BLayout
      title="Einstellungen"
      action={
        <div className="flex flex-col items-end gap-1">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: saved ? "rgba(74,222,128,0.15)" : contextAccent, color: saved ? "#4ade80" : "#0f0e0c", border: saved ? "1px solid rgba(74,222,128,0.3)" : "none" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Gespeichert" : "Speichern"}
          </button>
          {saveError && <p className="text-xs" style={{ color: "#f87171" }}>{saveError}</p>}
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b pb-4" style={{ borderColor: "#302d28" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === id ? `${contextAccent}1A` : "transparent",
              color: tab === id ? contextAccent : "#8a8278",
              border: `1px solid ${tab === id ? contextAccent : "transparent"}`,
            }}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* White-Label tab */}
      {tab === "whitelabel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Logo</h3>
              <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all" style={{ borderColor: "#302d28" }}>
                {form.logo_url ? (
                  <div>
                    <img src={form.logo_url} alt="Logo" className="max-h-20 mx-auto mb-3 object-contain" />
                    <button onClick={() => set("logo_url", "")} className="text-xs" style={{ color: "#5a554e" }}>Entfernen</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: "#5a554e" }} />
                    <p className="text-sm" style={{ color: "#5a554e" }}>{uploading ? "Lädt hoch…" : "Logo hochladen (PNG / SVG, max. 2 MB)"}</p>
                    <input type="file" accept="image/png,image/svg+xml" className="hidden" onChange={uploadLogo} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Branding</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Unternehmensname (Anzeige)</label>
                  <input value={form.name || ""} onChange={e => set("name", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Tagline / Slogan</label>
                  <input value={form.tagline || ""} onChange={e => set("tagline", e.target.value)} placeholder="Mit Würde begleiten."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Akzentfarbe</h3>
              <div className="grid grid-cols-4 gap-3">
                {ACCENT_COLORS.map(c => (
                  <button key={c.id} onClick={() => set("accent_color", c.id)}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl transition-all"
                    style={{ border: `2px solid ${form.accent_color === c.id ? c.id : "#302d28"}` }}>
                    <div className="w-8 h-8 rounded-full" style={{ background: c.id }} />
                    <span className="text-xs text-center" style={{ color: "#8a8278" }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>White-Label aktivieren</p>
                <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>Evertrace-Logo auf Kundenseiten ausblenden</p>
              </div>
              <button onClick={() => set("whitelabel_enabled", !form.whitelabel_enabled)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: form.whitelabel_enabled ? "#c9a96e" : "#302d28" }}>
                <div className="w-5 h-5 rounded-full absolute top-0.5 transition-all" style={{ background: "white", left: form.whitelabel_enabled ? "26px" : "2px" }} />
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <div className="sticky top-8">
              <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#5a554e" }}>
                <Eye className="w-3.5 h-3.5" /> Live-Vorschau
              </p>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #302d28" }}>
                {/* Header preview */}
                <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ background: "#0f0e0c", borderColor: "#302d28" }}>
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent }}>
                      <span style={{ color: "#0f0e0c", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 13 }}>
                        {(form.name || "E").charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                      {form.name || "Ihr Bestattungshaus"}
                    </p>
                    {form.tagline && <p className="text-xs" style={{ color: "#8a8278" }}>{form.tagline}</p>}
                  </div>
                </div>
                {/* Card preview */}
                <div className="p-6 text-center" style={{ background: "#181714" }}>
                  <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: accent }} />
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: accent }}>In liebevoller Erinnerung</p>
                  <p className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Maria Mustermann</p>
                  <p className="text-sm mt-1" style={{ color: "#8a8278" }}>01.01.1945 · 15.03.2025</p>
                  <p className="text-sm mt-4 italic leading-7 max-w-xs mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#d4c5a9" }}>
                    Ein Leben voller Güte und Herzlichkeit hinterlässt uns eine Lücke, die niemand füllen kann.
                  </p>
                </div>
                {!form.whitelabel_enabled && (
                  <div className="px-5 py-2 text-center border-t" style={{ background: "#0f0e0c", borderColor: "#302d28" }}>
                    <p className="text-xs" style={{ color: "#5a554e" }}>Erstellt mit Evertrace</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account tab */}
      {tab === "account" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Unternehmensdaten</h3>
            <div className="space-y-4">
              {[
                { k: "company_address", label: "Adresse" },
                { k: "vat_number", label: "Steuernummer / USt-IdNr." },
                { k: "contact_person", label: "Ansprechpartner" },
                { k: "contact_email", label: "E-Mail" },
                { k: "contact_phone", label: "Telefon" },
              ].map(({ k, label }) => (
                <div key={k}>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                  <input value={form[k] || ""} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan tab */}
      {tab === "plan" && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Aktueller Tarif</h3>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.3)" }}>
              <div>
                <p className="font-semibold" style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{plan.name}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>{plan.limits}</p>
                <p className="text-xs mt-1" style={{ color: "#5a554e" }}>{plan.price} · zzgl. MwSt.</p>
              </div>
              {form.plan !== "enterprise" && (
                <a href="/B2BRegister" className="text-sm px-4 py-2 rounded-xl" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Upgraden</a>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Nutzungslimits</h3>
            <div className="space-y-4">
              {[
                { label: "Fälle diesen Monat", current: home?.cases_this_month || 0, max: limits.cases },
                { label: "Erstellte Karten diesen Monat", current: home?.cards_this_month || 0, max: limits.cards },
              ].map(({ label, current, max }) => {
                const pct = max === Infinity ? 0 : Math.min(100, Math.round((current / max) * 100));
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: "#8a8278" }}>{label}</span>
                      <span style={{ color: "#f0ede8" }}>{current} / {max === Infinity ? "∞" : max}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#302d28" }}>
                      <div className="h-2 rounded-full" style={{ background: pct > 80 ? "#f87171" : "#c9a96e", width: `${max === Infinity ? 20 : pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrade plan grid */}
          {form.plan !== "enterprise" && (
            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Verfügbare Tarife</h3>
              <div className="space-y-3">
                {[
                  { id: "starter", name: "Starter", price: "€ 39 / Monat", desc: "15 Fälle · 20 Karten · White-Label · Print-on-Demand" },
                  { id: "premium", name: "Premium", price: "€ 99 / Monat", desc: "50 Fälle · 75 Karten · Analytics · QR-Code · Team", badge: "Empfohlen" },
                  { id: "enterprise", name: "Enterprise", price: "Ab € 299 / Monat", desc: "Unbegrenzt · API · Dedizierter Manager · SLA" },
                ].map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "#201e1a", border: `1px solid ${p.id === "premium" ? "#c9a96e" : "#302d28"}` }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: "#f0ede8" }}>{p.name}</p>
                        {p.badge && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,169,110,0.2)", color: "#c9a96e" }}>{p.badge}</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>{p.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold" style={{ color: "#c9a96e" }}>{p.price}</p>
                      <p className="text-xs" style={{ color: "#5a554e" }}>zzgl. MwSt.</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/B2BRegister"
                className="mt-4 flex items-center justify-center w-full py-3 rounded-xl text-sm font-medium"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                Tarif upgraden →
              </a>
            </div>
          )}
        </div>
      )}
    </B2BLayout>
  );
}