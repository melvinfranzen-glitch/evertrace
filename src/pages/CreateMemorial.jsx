import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Sparkles, ChevronRight, ChevronLeft, Check, QrCode, ArrowLeft } from "lucide-react";

const STYLES = [
  { id: "poetisch", label: "Poetisch", desc: "Gefühlvoll und bildreich – ein literarisches Denkmal" },
  { id: "chronologisch", label: "Chronologisch", desc: "Strukturiert und klar – das Leben in seiner ganzen Breite" },
  { id: "lebensfroh", label: "Lebensfroh", desc: "Warm und positiv – voller schöner Momente und Lebensfreude" },
];

function StepDot({ n, current }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
        style={{
          background: done || active ? "#b45309" : "#e7e5e4",
          color: done || active ? "white" : "#9ca3af",
        }}
      >
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      {n < 3 && (
        <div className="w-16 h-0.5 rounded" style={{ background: done ? "#b45309" : "#e7e5e4" }} />
      )}
    </div>
  );
}

export default function CreateMemorial() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    death_date: "",
    birth_place: "",
    death_place: "",
    subtitle: "",
    hero_image_url: "",
    biography_style: "chronologisch",
    biography_raw_input: "",
    biography: "",
    is_private: false,
    access_password: "",
    plan: "free",
    status: "active",
    short_id: Math.random().toString(36).substr(2, 8).toUpperCase(),
    candle_count: 0,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("hero_image_url", file_url);
    setUploading(false);
  };

  const generateBio = async () => {
    if (!form.biography_raw_input.trim()) return;
    setGenerating(true);
    const style = STYLES.find((s) => s.id === form.biography_style);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle eine ${style.label.toLowerCase()} Biografie auf Deutsch für ${form.name} (geboren: ${form.birth_date || "unbekannt"} in ${form.birth_place || "unbekannt"}, gestorben: ${form.death_date || "unbekannt"} in ${form.death_place || "unbekannt"}). Basiere auf diesen Erinnerungen und Fakten: "${form.biography_raw_input}". Schreibe 3–4 würdevolle Absätze im Stil: ${style.desc}. Beginne direkt mit der Biografie ohne Überschrift.`,
    });
    set("biography", result);
    setGenerating(false);
  };

  const [created, setCreated] = useState(false);
  const [createdShortId, setCreatedShortId] = useState("");

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    if (!data.access_password) delete data.access_password;
    await base44.entities.Memorial.create(data);
    setSaving(false);
    setCreatedShortId(form.short_id);
    setCreated(true);
  };

  if (created) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "#ecfdf5" }}>
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gedenkseite erstellt</h2>
            <p className="text-gray-500 text-sm">Die Gedenkseite für {form.name} ist jetzt aktiv.</p>
          </div>
          <Button onClick={() => window.location.href = createPageUrl("Dashboard")} className="text-white rounded-xl px-8" style={{ background: "#c9a96e" }}>
            Zum Dashboard
          </Button>

          {/* Upsell card */}
          <div className="text-left" style={{ background: "#181714", border: "1px solid rgba(201,169,110,0.25)", borderRadius: 14, padding: 24 }}>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}>
              Empfehlung
            </span>
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
              Machen Sie die Erinnerung greifbar
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#8a8278" }}>
              Eine gravierte Plakette mit QR-Code verbindet den Grabstein direkt mit dieser Gedenkseite. Besucher scannen den Code und landen sofort auf der persönlichen Erinnerungsseite.
            </p>
            <button
              onClick={() => window.location.href = `/Shop?memorial_id=${createdShortId}`}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}
            >
              Plakette bestellen ab € 129,–
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memorialUrl = `${window.location.origin}/MemorialProfile?id=${form.short_id}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(memorialUrl)}`;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.location.href = createPageUrl("Dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zum Dashboard
        </button>

        {/* Step indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {[1, 2, 3].map((n) => <StepDot key={n} n={n} current={step} />)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Persönliche Daten
                </h1>
                <p className="text-gray-500 text-sm mt-1">Grundlegende Informationen zur verstorbenen Person</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Vollständiger Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maria Elisabeth Müller" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Geburtsdatum</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Sterbedatum</Label>
                  <Input type="date" value={form.death_date} onChange={(e) => set("death_date", e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Geburtsort</Label>
                  <Input value={form.birth_place} onChange={(e) => set("birth_place", e.target.value)} placeholder="München" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Sterbeort</Label>
                  <Input value={form.death_place} onChange={(e) => set("death_place", e.target.value)} placeholder="Berlin" className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Leitspruch oder Lieblingszitat</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder='„In Liebe und Dankbarkeit"'
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Portrait-Foto</Label>
                <div className="mt-1 border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
                  {form.hero_image_url ? (
                    <div>
                      <img src={form.hero_image_url} className="w-28 h-28 object-cover rounded-full mx-auto" alt="Portrait" />
                      <p className="mt-2 text-sm font-medium" style={{ color: "#16a34a" }}>✓ Bild hochgeladen</p>
                      <button className="mt-1 text-xs text-gray-400 hover:text-gray-600" onClick={() => set("hero_image_url", "")}>Entfernen</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                          <p className="text-sm text-gray-500">Klicken zum Hochladen (JPG, PNG)</p>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!form.name.trim()}
                  className="text-white rounded-xl px-6"
                  style={{ background: "#b45309" }}
                >
                  Weiter <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Die Lebensgeschichte festhalten
                </h1>
                <p className="text-gray-500 text-sm mt-1">Erzählen Sie uns von besonderen Momenten — wir helfen dabei, daraus eine fließende Geschichte zu weben.</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Biografie-Stil wählen</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STYLES.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => set("biography_style", s.id)}
                      className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: form.biography_style === s.id ? "#b45309" : "#e7e5e4",
                        background: form.biography_style === s.id ? "#fffbf5" : "white",
                      }}
                    >
                      <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Besondere Momente & Erinnerungen *</Label>
                <Textarea
                  value={form.biography_raw_input}
                  onChange={(e) => set("biography_raw_input", e.target.value)}
                  placeholder={`Erzählen Sie uns ein wenig über das Leben von ${form.name || "dieser Person"}. Was hat sie/ihn besonders gemacht? Beruf, Leidenschaften, Lieblingsplätze, Familie, unvergessliche Momente — alles ist willkommen.`}
                  className="mt-1 h-36 resize-none"
                />
              </div>

              <Button
                onClick={generateBio}
                disabled={!form.biography_raw_input.trim() || generating}
                className="w-full rounded-xl text-white py-5"
                style={{ background: generating ? "#9a7252" : "#b45309" }}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Biografie wird verfasst...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Lebensgeschichte verfassen</>
                )}
              </Button>

              {form.biography && (
                <div className="rounded-xl p-6 border border-stone-200" style={{ background: "#fafaf8" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#b45309" }}>
                      Entwurf der Lebensgeschichte
                    </p>
                    <button className="text-xs text-gray-400 hover:text-gray-600 underline" onClick={() => set("biography", "")}>
                      Neu verfassen
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{form.biography}</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!form.biography.trim()}
                  className="text-white rounded-xl px-6"
                  style={{ background: "#b45309" }}
                >
                  Weiter <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Fertigstellen
                </h1>
                <p className="text-gray-500 text-sm mt-1">Ihr persönlicher QR-Code & letzte Einstellungen</p>
              </div>

              <div className="rounded-xl border border-stone-200 p-6 text-center" style={{ background: "#fafaf8" }}>
                <QrCode className="w-7 h-7 mx-auto mb-3 text-amber-700" />
                <p className="font-medium text-gray-800 mb-4">Ihr persönlicher QR-Code</p>
                <img src={qrSrc} alt="QR Code" className="mx-auto rounded-lg" style={{ width: 140, height: 140 }} />
                <p className="text-xs text-gray-400 mt-3 break-all">{memorialUrl}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Spotify-URL (optional)</Label>
                <Input
                  value={form.spotify_url || ""}
                  onChange={(e) => set("spotify_url", e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="mt-1"
                />
              </div>

              <div
                className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 cursor-pointer"
                onClick={() => set("is_private", !form.is_private)}
                style={{ background: form.is_private ? "#fffbf5" : "white" }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
                  style={{ borderColor: form.is_private ? "#b45309" : "#d1d5db", background: form.is_private ? "#b45309" : "white" }}
                >
                  {form.is_private && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Private Gedenkseite</p>
                  <p className="text-xs text-gray-400">Nur mit Passwort zugänglich</p>
                </div>
              </div>

              {form.is_private && (
                <div>
                  <Label className="text-sm font-medium">Zugriffspasswort</Label>
                  <Input
                    type="text"
                    value={form.access_password}
                    onChange={(e) => set("access_password", e.target.value)}
                    placeholder="Passwort für Besucher festlegen"
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-white rounded-xl px-6"
                  style={{ background: "#b45309" }}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Gedenkseite erstellen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}