import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// Fix 2: Prompt Injection Sanitization
function sanitizePromptInput(str, maxLength = 500) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[<>\"\'`]/g, "")
    .replace(/\b(ignore|system|assistant|instructions|prompt|override|jailbreak|disregard)\b/gi, "")
    .replace(/\s{3,}/g, " ")
    .trim()
    .slice(0, maxLength);
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Sparkles, ChevronRight, ChevronLeft, Check, ArrowLeft, Copy } from "lucide-react";
import DateInput from "@/components/ui/DateInput";

const STYLES = [
  { id: "poetisch", label: "Poetisch", desc: "Gefühlvoll und bildreich — ein literarisches Denkmal" },
  { id: "chronologisch", label: "Erzählend", desc: "Strukturiert und klar — das Leben in seiner ganzen Breite, von Anfang bis Ende." },
  { id: "lebensfroh", label: "Lebensfroh", desc: "Warm und positiv — voller schöner Momente und Lebensfreude" },
];

function StepDot({ n, current }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
        style={{
          background: done || active ? "#c9a96e" : "#e7e5e4",
          color: done || active ? "white" : "#9ca3af",
        }}
      >
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      {n < 3 && (
        <div className="w-12 sm:w-16 h-0.5 rounded" style={{ background: done ? "#c9a96e" : "#e7e5e4" }} />
      )}
    </div>
  );
}

export default function CreateMemorial() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bioMode, setBioMode] = useState("guided");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState({ passions: [], profession: "", quote: "", style: "chronologisch" });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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
     prompt: `Erstelle eine ${style.label.toLowerCase()} Biografie auf Deutsch für ${form.name} (geboren: ${form.birth_date || "unbekannt"} in ${form.birth_place || "unbekannt"}, gestorben: ${form.death_date || "unbekannt"} in ${form.death_place || "unbekannt"}). Basiere auf diesen Erinnerungen und Fakten: "${sanitizePromptInput(form.biography_raw_input)}". Schreibe 3–4 würdevolle Absätze im Stil: ${style.desc}. Beginne direkt mit der Biografie ohne Überschrift.`,
    });
    set("biography", result);
    setGenerating(false);
  };

  const [created, setCreated] = useState(false);
  const [createdShortId, setCreatedShortId] = useState("");

  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    if (!data.access_password) delete data.access_password;
    await base44.entities.Memorial.create(data);
    // Send confirmation email
    try {
      const u = await base44.auth.me();
      if (u?.email) {
        await base44.integrations.Core.SendEmail({
          to: u.email,
          subject: `Ihre Gedenkseite für ${form.name} ist fertig`,
          body: `Ihre Gedenkseite ist jetzt erreichbar.\n\n${window.location.origin}/MemorialProfile?id=${form.short_id}\n\nTeilen Sie diesen Link mit Ihrer Familie und Ihren Freunden.`,
        });
      }
    } catch {
      // TODO: send confirmation email via SendEmail integration
    }
    setSaving(false);
    setCreatedShortId(form.short_id);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowShare(true);
    }, 3000);
  };

  const shareUrl = `${window.location.origin}/MemorialProfile?id=${form.short_id}`;
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const memorialUrl = `${window.location.origin}/MemorialProfile?id=${form.short_id}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(memorialUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (showShare) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
        <div className="max-w-md w-full text-center space-y-6">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#2c2419", fontWeight: 600 }}>
            Möchten Sie den Link gleich teilen?
          </h2>
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3">
            <input readOnly value={shareUrl} className="flex-1 text-sm outline-none bg-transparent" style={{ color: "#6b7280" }} />
            <button onClick={copyShareLink} style={{ color: shareCopied ? "#16a34a" : "#c9a96e", fontSize: 12, whiteSpace: "nowrap" }}>
              {shareCopied ? "✓ Kopiert" : "Kopieren"}
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Gedenkseite für ${form.name}: ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#25D366", color: "white" }}
            >
              WhatsApp teilen
            </a>
            <button onClick={copyShareLink}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e" }}>
              Link kopieren
            </button>
          </div>
          <button onClick={() => { setShowShare(false); setCreated(true); }}
            style={{ fontSize: 13, color: "#8a8278" }}>
            Weiter zum Dashboard →
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #1a1410, #231a0e)" }}>
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ background: "rgba(201,169,110,0.15)", border: "2px solid #c9a96e" }}>
            <Check className="w-10 h-10" style={{ color: "#c9a96e" }} />
          </div>
          <h2 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "white", fontWeight: 600 }}>
            Die Gedenkseite ist fertig.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#c9a96e" }}>
            Sie können sie jetzt mit Ihrer Familie teilen.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.location.href = createPageUrl("Dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zum Dashboard
        </button>

        {/* Warm introduction */}
        <div className="text-center mb-8">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#2c2419", fontWeight: 600 }}>
            Sie schaffen gerade etwas Bleibendes.
          </h2>
          <p className="mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a8278" }}>
            Das dauert etwa 10 Minuten. Wir führen Sie Schritt für Schritt.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {[1, 2, 3].map((n) => <StepDot key={n} n={n} current={step} />)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h1 className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26 }}>
                  Wer soll erinnert werden?
                </h1>
                <p className="text-sm mt-1" style={{ color: "#8a8278" }}>
                  Beginnen Sie mit dem Namen und einem Foto — alles andere können Sie auch später noch ergänzen.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-medium">Name der verstorbenen Person</Label>
                  <span style={{ fontSize: 11, color: "#8a8278" }}>(Pflichtfeld)</span>
                </div>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Vollständiger Name, so wie Sie ihn kennen" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Geburtsdatum</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} className="mt-1" />
                  <p style={{ fontSize: 11, color: "#8a8278", marginTop: 4 }}>Falls unbekannt, lassen Sie das Feld frei.</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sterbedatum</Label>
                  <Input type="date" value={form.death_date} onChange={(e) => set("death_date", e.target.value)} className="mt-1" />
                  <p style={{ fontSize: 11, color: "#8a8278", marginTop: 4 }}>Dieses Datum erscheint auf der Gedenkseite.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Geburtsort</Label>
                  <Input value={form.birth_place} onChange={(e) => set("birth_place", e.target.value)}
                    placeholder="Stadt, in der er/sie aufgewachsen ist" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Ort des Abschieds</Label>
                  <Input value={form.death_place} onChange={(e) => set("death_place", e.target.value)}
                    placeholder="Stadt oder Ort des Sterbens" className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Ein Lieblingszitat oder Satz, der zu ihm/ihr passte</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder='„Nicht trauern, dass es vorbei ist — sondern lächeln, dass es war."'
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Ein Foto, das ihn/sie zeigt wie er/sie war</Label>
                <div className="mt-1 border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
                  {form.hero_image_url ? (
                    <div>
                      <img src={form.hero_image_url} className="w-28 h-28 object-cover rounded-full mx-auto" alt="Portrait" />
                      <p className="mt-2 text-sm font-medium" style={{ color: "#16a34a" }}>✓ Foto hochgeladen</p>
                      <button className="mt-1 text-xs text-gray-400 hover:text-gray-600" onClick={() => set("hero_image_url", "")}>Entfernen</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            {isMobile ? "Tippen Sie hier, um ein Foto von Ihrem Handy auszuwählen" : "Klicken Sie hier, um ein Foto hochzuladen"}
                          </p>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#8a8278", marginTop: 6 }}>
                  Das Foto wird sicher gespeichert und ist nur für Personen sichtbar, denen Sie den Link teilen.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!form.name.trim()}
                  className="text-white rounded-xl px-6 w-full sm:w-auto"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}
                >
                  Weiter → Lebensgeschichte <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="mb-4">
                <h1 className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26 }}>
                  Erzählen Sie uns von ihm/ihr.
                </h1>
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden border border-stone-200 w-fit">
                {[{ id: "guided", label: "Geführt" }, { id: "direct", label: "Direkt" }].map(m => (
                  <button key={m.id} onClick={() => { setBioMode(m.id); setQuestionIndex(0); }}
                    className="px-5 py-2 text-sm font-medium transition-all"
                    style={{ background: bioMode === m.id ? "#c9a96e" : "white", color: bioMode === m.id ? "white" : "#6b7280" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Guided mode */}
              {bioMode === "guided" && !generating && !form.biography && (() => {
                const PASSION_CHIPS = ["Familie", "Natur", "Musik", "Reisen", "Handwerk", "Tiere", "Glaube", "Kochen", "Sport", "Kunst"];
                const togglePassion = (p) => setGuidedAnswers(a => ({ ...a, passions: a.passions.includes(p) ? a.passions.filter(x => x !== p) : [...a.passions, p] }));
                return (
                  <div className="space-y-5">
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#c9a96e" }}>Frage {questionIndex + 1} von 4</p>
                    <div className="w-full h-1 rounded-full bg-stone-100 mb-2">
                      <div className="h-1 rounded-full transition-all" style={{ width: `${((questionIndex + 1) / 4) * 100}%`, background: "#c9a96e" }} />
                    </div>

                    {questionIndex === 0 && (
                      <div>
                        <p className="font-medium text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                          Was hat {form.name || "er/sie"} am meisten geliebt im Leben?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {PASSION_CHIPS.map(p => (
                            <button key={p} onClick={() => togglePassion(p)}
                              className="px-4 py-2 rounded-full text-sm transition-all"
                              style={{ background: guidedAnswers.passions.includes(p) ? "rgba(201,169,110,0.15)" : "white", border: `1px solid ${guidedAnswers.passions.includes(p) ? "#c9a96e" : "#e5e7eb"}`, color: guidedAnswers.passions.includes(p) ? "#c9a96e" : "#6b7280", cursor: "pointer" }}>
                              {p}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setQuestionIndex(1)} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter →</button>
                      </div>
                    )}

                    {questionIndex === 1 && (
                      <div>
                        <p className="font-medium text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                          Welchen Beruf hatte {form.name || "er/sie"}?
                        </p>
                        <input value={guidedAnswers.profession} onChange={e => setGuidedAnswers(a => ({ ...a, profession: e.target.value }))}
                          placeholder="z. B. Lehrerin, Schreiner, Bäcker… (optional)"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none" />
                        <button onClick={() => setQuestionIndex(2)} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter →</button>
                      </div>
                    )}

                    {questionIndex === 2 && (
                      <div>
                        <p className="font-medium text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                          Gibt es einen Satz oder ein Zitat, das zu {form.name || "ihm/ihr"} passt?
                        </p>
                        <input value={guidedAnswers.quote} onChange={e => setGuidedAnswers(a => ({ ...a, quote: e.target.value }))}
                          placeholder="z. B. »Das Beste, was wir hinterlassen, sind Erinnerungen.« (optional)"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none" />
                        <button onClick={() => setQuestionIndex(3)} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter →</button>
                      </div>
                    )}

                    {questionIndex === 3 && (
                      <div>
                        <p className="font-medium text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                          Wie soll die Geschichte klingen?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                          {STYLES.map(s => (
                            <div key={s.id} onClick={() => setGuidedAnswers(a => ({ ...a, style: s.id }))}
                              className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                              style={{ borderColor: guidedAnswers.style === s.id ? "#c9a96e" : "#e7e5e4", background: guidedAnswers.style === s.id ? "#fffbf5" : "white" }}>
                              <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                        <button onClick={async () => {
                          const rawInput = `Leidenschaften: ${guidedAnswers.passions.join(", ") || "keine Angabe"}. Beruf: ${guidedAnswers.profession || "keine Angabe"}. Zitat: ${guidedAnswers.quote || "keines"}.`;
                          set("biography_raw_input", rawInput);
                          set("biography_style", guidedAnswers.style);
                          setGenerating(true);
                          const style = STYLES.find(s => s.id === guidedAnswers.style);
                          const result = await base44.integrations.Core.InvokeLLM({
                            prompt: `Erstelle eine ${style.label.toLowerCase()} Biografie auf Deutsch für ${form.name} (geboren: ${form.birth_date || "unbekannt"} in ${form.birth_place || "unbekannt"}, gestorben: ${form.death_date || "unbekannt"} in ${form.death_place || "unbekannt"}). Basiere auf: "${sanitizePromptInput(rawInput)}". 3–4 würdevolle Absätze im Stil: ${style.desc}. Beginne direkt.`,
                          });
                          set("biography", result);
                          setGenerating(false);
                        }} className="w-full py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                          ✦ Lebensgeschichte verfassen lassen
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Generating */}
              {generating && (
                <div className="flex items-center gap-3 py-6">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#c9a96e" }} />
                  <span className="text-sm" style={{ color: "#8a8278" }}>Wir schreiben gerade die Lebensgeschichte…</span>
                </div>
              )}

              {/* Direct mode */}
              {bioMode === "direct" && !form.biography && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-sm font-medium" style={{ color: "#5a554e" }}>Wie soll die Geschichte klingen?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {STYLES.map((s) => (
                        <div key={s.id} onClick={() => set("biography_style", s.id)}
                          className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                          style={{ borderColor: form.biography_style === s.id ? "#c9a96e" : "#e7e5e4", background: form.biography_style === s.id ? "#fffbf5" : "white" }}>
                          <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Was sollen Menschen über ihn/sie wissen?</Label>
                    <Textarea value={form.biography_raw_input} onChange={(e) => set("biography_raw_input", e.target.value)}
                      placeholder="Schreiben Sie einfach, was Ihnen einfällt…"
                      className="mt-1 h-44 resize-none" />
                  </div>
                  <Button onClick={generateBio} disabled={!form.biography_raw_input.trim() || generating}
                    className="w-full rounded-xl text-white py-5" style={{ background: "#c9a96e" }}>
                    ✦ Lebensgeschichte von der KI verfassen lassen
                  </Button>
                </div>
              )}

              {/* Biography result */}
              {form.biography && !generating && (
                <div className="rounded-xl p-6 border border-stone-200" style={{ background: "#fafaf8" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c9a96e" }}>
                      Ihr Entwurf — bitte lesen und bei Bedarf anpassen
                    </p>
                    <button className="text-xs text-gray-400 hover:text-gray-600 underline" onClick={() => { set("biography", ""); setQuestionIndex(0); }}>
                      ↺ Neu schreiben lassen
                    </button>
                  </div>
                  <textarea value={form.biography} onChange={(e) => set("biography", e.target.value)}
                    style={{ background: "transparent", border: "none", outline: "none", resize: "none", width: "100%", fontSize: 14, color: "#374151", lineHeight: 1.8 }}
                    rows={Math.max(6, form.biography.split("\n").length + 2)} />
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
                </Button>
                <Button onClick={() => setStep(3)} disabled={!form.biography.trim()}
                  className="text-white rounded-xl px-6" style={{ background: "#c9a96e" }}>
                  Weiter → Abschließen <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h1 className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26 }}>
                  Fast geschafft — noch zwei Schritte.
                </h1>
                <p className="text-sm mt-1" style={{ color: "#8a8278" }}>
                  Ihre Gedenkseite ist gleich fertig. Darunter sehen Sie bereits Ihren persönlichen QR-Code.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-6 text-center" style={{ background: "#fafaf8" }}>
                <p className="font-medium text-gray-800 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}>
                  Ihr persönlicher QR-Code ist bereit
                </p>
                <img src={qrSrc} alt="QR Code" className="mx-auto rounded-lg mb-3" style={{ width: 140, height: 140 }} />
                <p className="mb-4" style={{ fontSize: 13, color: "#6b5a44", lineHeight: 1.6 }}>
                  Diesen Code können Sie ausdrucken und ans Grab stellen. Wer ihn scannt, gelangt direkt zur Gedenkseite.
                </p>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: copied ? "rgba(74,222,128,0.1)" : "rgba(201,169,110,0.1)", border: `1px solid ${copied ? "#4ade80" : "rgba(201,169,110,0.4)"}`, color: copied ? "#16a34a" : "#c9a96e" }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "✓ Kopiert!" : "Link kopieren"}
                </button>
              </div>

              <div>
                <Label className="text-sm font-medium">Lieblingsmusik hinzufügen (optional)</Label>
                <p style={{ fontSize: 11, color: "#8a8278", marginTop: 4, marginBottom: 6 }}>
                  Falls die verstorbene Person eine Lieblingsplaylist auf Spotify hatte, können Sie hier den Link einfügen. Die Musik wird dann auf der Gedenkseite abgespielt.
                </p>
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
                  style={{ borderColor: form.is_private ? "#c9a96e" : "#d1d5db", background: form.is_private ? "#c9a96e" : "white" }}
                >
                  {form.is_private && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Gedenkseite schützen</p>
                  <p className="text-xs text-gray-400">Nur Personen mit dem Passwort können die Seite sehen.</p>
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
                  style={{ background: "#c9a96e", color: "#0f0e0c", height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 17, borderRadius: 12 }}
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "✦"}&nbsp;
                  {saving ? "Wird veröffentlicht…" : "Gedenkseite jetzt veröffentlichen"}
                </Button>
              </div>
              <p style={{ fontSize: 11, color: "#8a8278", textAlign: "center" }}>
                Sie können die Gedenkseite jederzeit bearbeiten und erweitern.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}