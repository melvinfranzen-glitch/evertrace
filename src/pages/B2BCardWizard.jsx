import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";

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
import CardPrintPreview from "@/components/b2b/CardPrintPreview";
import { Check, ChevronRight, RefreshCw, Loader2, QrCode, Mail, BookOpen, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const FORMATS = [
  { id: "DIN_A6_landscape", label: "DIN A6 quer", desc: "148 × 105 mm" },
  { id: "DIN_lang_portrait", label: "DIN lang", desc: "99 × 210 mm" },
  { id: "DIN_A5_folded", label: "DIN A5 gefaltet", desc: "148 × 210 mm, 4-seitig" },
  { id: "Leporello", label: "Leporello", desc: "Faltformat, mehrere Seiten" },
];

const PASSIONS = ["Familie", "Natur & Garten", "Musik", "Reisen", "Handwerk", "Tiere", "Glaube & Spiritualität", "Kochen & Backen", "Sport", "Kunst"];

const MOTIFS = [
  { id: "floral_classic", label: "Florales Klassik", color: "#a78bfa" },
  { id: "minimalist", label: "Minimalistisch", color: "#94a3b8" },
  { id: "religious", label: "Religiös / Sakral", color: "#c9a96e" },
  { id: "nature", label: "Natur / Baum", color: "#4ade80" },
  { id: "maritime", label: "Maritime", color: "#60a5fa" },
  { id: "forest", label: "Waldmotiv", color: "#86efac" },
  { id: "handwerk", label: "Handwerk / Beruf", color: "#fb923c" },
];

const TONES = ["Förmlich & würdevoll", "Warm & persönlich", "Poetisch & lyrisch"];
import { PRINT_TIERS as TIER_DATA, ADDON_PRICES, DEFAULT_CARD_QUANTITY, fmtEur } from "@/components/pricing/pricingData";

const PRINT_TIERS = TIER_DATA;

const WIZARD_STEPS = ["Fall & Format", "Fragebogen", "KI-Vorschau", "Druckkonfiguration", "Bestellung"];

export default function B2BCardWizard() {
  const params = new URLSearchParams(window.location.search);
  const preselectedCaseId = params.get("case_id");

  const [step, setStep] = useState(0);
  const [cases, setCases] = useState([]);
  const [funeralHome, setFuneralHome] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || "");
  const [selectedCase, setSelectedCase] = useState(null);
  const [cardFormat, setCardFormat] = useState("DIN_A6_landscape");
  const [previewSide, setPreviewSide] = useState("front"); // "front" | "inside"
  const [schnellmodus, setSchnellmodus] = useState(false);

  // Questionnaire
  const [character, setCharacter] = useState("");
  const [passions, setPassions] = useState([]);
  const [customPassion, setCustomPassion] = useState("");
  const [quote, setQuote] = useState("");
  const [religion, setReligion] = useState("Weltlich");
  const [tone, setTone] = useState(TONES[1]);
  const [motif, setMotif] = useState("nature");
  const [profession, setProfession] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Generation
  const [generatedText, setGeneratedText] = useState("");
  const [generatedMotifUrl, setGeneratedMotifUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingMotif, setGeneratingMotif] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [variants, setVariants] = useState([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [generatingVariant, setGeneratingVariant] = useState(false);

  // Addons
  const [addonInvitation, setAddonInvitation] = useState(false);
  const [addonThankyou, setAddonThankyou] = useState(false);
  const [addonQr, setAddonQr] = useState(false);

  // Print config
  const [quantity, setQuantity] = useState(DEFAULT_CARD_QUANTITY);
  const [printTier, setPrintTier] = useState("standard");

  // Delivery
  const [deliveryMode, setDeliveryMode] = useState("funeral_home");
  const [customerNotificationEmail, setCustomerNotificationEmail] = useState(""); // "funeral_home" | "customer"
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    const draftId = params.get("draft_id");
    if (draftId) {
      base44.entities.MourningCard.filter({ id: draftId }).then(([draft]) => {
        if (!draft) return;
        setSelectedCaseId(draft.case_id || "");
        setCardFormat(draft.format || "DIN_A6_landscape");
        setEditedText(draft.generated_text || "");
        setGeneratedText(draft.generated_text || "");
        setGeneratedMotifUrl(draft.motif_image_url || "");
        setMotif(draft.motif_theme || "nature");
        setAddonInvitation(draft.addon_invitation || false);
        setAddonThankyou(draft.addon_thankyou || false);
        setAddonQr(draft.addon_qr || false);
        if (draft.questionnaire_answers) {
          try { const qa = JSON.parse(draft.questionnaire_answers); setCharacter(qa.character || ""); setPassions(qa.passions || []); setQuote(qa.quote || ""); setReligion(qa.religion || "Weltlich"); setTone(qa.tone || "Warm & persönlich"); setProfession(qa.profession || ""); } catch {}
        }
        setStep(2);
      });
    }
    const user = base44.auth.me().then(u => {
      base44.entities.Case.filter({ created_by: u.email, status: "aktiv" }, "-created_date").then(setCases);
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(([h]) => {
        if (h) setFuneralHome(h);
      });
    });
  }, []);

  useEffect(() => {
    if (selectedCaseId && cases.length) {
      const c = cases.find(c => c.id === selectedCaseId);
      setSelectedCase(c || null);
    }
  }, [selectedCaseId, cases]);

  // Pre-fill funeral home delivery address
  useEffect(() => {
    if (deliveryMode === "funeral_home" && funeralHome) {
      const addr = funeralHome.company_address || "";
      const parts = addr.split(",").map(s => s.trim());
      setDeliveryName(funeralHome.name || "");
      setDeliveryStreet(parts[0] || "");
      const cityPart = parts[1] || "";
      const zipMatch = cityPart.match(/^(\d{5})\s+(.*)/);
      if (zipMatch) { setDeliveryZip(zipMatch[1]); setDeliveryCity(zipMatch[2]); }
      else setDeliveryCity(cityPart);
    } else if (deliveryMode === "customer" && selectedCase) {
      setDeliveryName(selectedCase.next_of_kin_name || "");
      setDeliveryStreet(""); setDeliveryCity(""); setDeliveryZip("");
    }
  }, [deliveryMode, funeralHome, selectedCase]);

  const togglePassion = (p) => {
    setPassions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateText = async () => {
    setGenerating(true);
    const allPassions = schnellmodus ? "" : [...passions, ...(customPassion ? [customPassion] : [])].join(", ");
    const professionHint = schnellmodus ? "" : profession ? `Beruf/Handwerk: ${profession}.` : "";
    const briefDesc = schnellmodus ? shortDescription : "";
    const prompt = `Du bist ein Experte für würdevolle Trauerkarten auf Deutsch. Erstelle einen personalisierten Trauerkartentext:

  Name: ${selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : "Unbekannte Person"}
  Geburtsdatum: ${selectedCase ? fmtDate(selectedCase.date_of_birth) : "unbekannt"}
  Sterbedatum: ${selectedCase ? fmtDate(selectedCase.date_of_death) : "unbekannt"}
  ${schnellmodus ? `Kurzbeschreibung: ${briefDesc}` : `Charakter: ${character || "gütig und herzlich"}
  Leidenschaften: ${allPassions || "Familie und Natur"}
  ${professionHint}
  Zitat: ${quote || "keines angegeben"}
  Ausrichtung: ${religion || "nicht religiös"}
  Ton: ${tone}`}

Strukturiere den Text in drei klar erkennbare Abschnitte ohne Überschriften: Erstens ein eröffnender Satz, der den Charakter der Person in einer einzigen, präzisen Formulierung einfängt. Zweitens eine mittlere Passage von zwei bis drei Zeilen, die ihre Leidenschaften und ihren Beruf organisch verwebt. Drittens eine abschließende Zeile, die das angegebene Zitat oder einen würdigen Ersatz integriert, falls kein Zitat angegeben wurde. Gesamtlänge: 80 bis 110 Wörter. Der Text soll sich lesen, als wäre er von einem Menschen geschrieben worden, der die Person kannte — nicht wie ein KI-generierter Standardtext.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    if (typeof result === "string") {
      setGeneratedText(result);
      setEditedText(result);
    } else {
      console.warn("InvokeLLM returned unexpected type:", typeof result, result);
      const fallback = "Ein Leben voller Würde und Wärme — in liebevoller Erinnerung.";
      setGeneratedText(fallback);
      setEditedText(fallback);
    }
    setGenerating(false);
  };

  const addVariant = async () => {
    if (variants.length >= 3 || generatingVariant) return;
    setGeneratingVariant(true);
    const [textResult, imgResult] = await Promise.all([generateTextRaw(), generateMotifRaw()]);
    const newVariants = [...variants, { text: textResult, motifUrl: imgResult }];
    setVariants(newVariants);
    setActiveVariantIdx(newVariants.length - 1);
    setEditedText(textResult);
    setGeneratedMotifUrl(imgResult);
    setGeneratingVariant(false);
  };

  const generateTextRaw = async () => {
    const allPassions = [...passions, ...(customPassion ? [customPassion] : [])].join(", ");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle einen personalisierten Trauerkartentext (80-110 Wörter) auf Deutsch für ${selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : "Unbekannte Person"}. Charakter: ${character || "gütig"}. Leidenschaften: ${allPassions || "das Leben"}. Zitat: ${quote || ""}. Ton: ${tone}.`,
    });
    return typeof result === "string" ? result : "";
  };

  const generateMotifRaw = async () => {
    const prompt = `Minimalist memorial card front cover illustration. Style: elegant, dark background, single symbolic motif for theme: "${motif}". Thin gold lines, no text, no faces. Ultra-minimal, sophisticated, print-ready.`;
    const { url } = await base44.integrations.Core.GenerateImage({ prompt });
    return url;
  };

  const generateMotif = async () => {
    setGeneratingMotif(true);
    const allPassions = [...passions, ...(customPassion ? [customPassion] : [])].join(", ");
    const profHint = profession ? `, referencing the profession: ${profession}` : "";
    const prompt = `Minimalist memorial card front cover illustration. Style: elegant, dark background (#0f0e0c or deep navy), single symbolic motif${profHint}. Motif theme: "${motif}" (e.g. for "nature": a lone bare tree; for "maritime": an anchor; for "handwerk": craftsman tools in silhouette). Very thin gold lines (#c9a96e), no text, no faces, no people. Suitable for a premium German funeral card. Ultra-minimal, sophisticated, print-ready.`;
    const { url } = await base44.integrations.Core.GenerateImage({ prompt });
    setGeneratedMotifUrl(url);
    setGeneratingMotif(false);
  };

  useEffect(() => {
    if (step === 2 && !generatedText) {
      // Sequential: text first, then image
      (async () => {
        await generateText();
        await generateMotif();
      })();
    }
  }, [step]);

  const tier = PRINT_TIERS.find(t => t.id === printTier);
  const addonInvPrice = addonInvitation ? ADDON_PRICES.invitation_bundle * quantity : 0;
  const addonThkPrice = addonThankyou ? ADDON_PRICES.thankyou_bundle * quantity : 0;
  const cardsSubtotal = tier ? tier.basePrice * quantity : 0;
  const shipping = tier ? tier.shipping : 0;
  const totalPrice = fmtEur(cardsSubtotal + addonInvPrice + addonThkPrice + shipping);

  const submitOrder = async () => {
    setSubmitting(true);
    const user = await base44.auth.me();
    const card = await base44.entities.MourningCard.create({
      case_id: selectedCaseId,
      format: cardFormat,
      questionnaire_answers: JSON.stringify({ character, passions, quote, religion, tone, profession }),
      generated_text: editedText,
      motif_theme: motif,
      motif_image_url: generatedMotifUrl,
      addon_invitation: addonInvitation,
      addon_thankyou: addonThankyou,
      addon_qr: addonQr,
      status: "bestellt",
    });
    await base44.entities.PrintOrder.create({
      case_id: selectedCaseId,
      card_id: card.id,
      order_type: "Trauerkarte",
      quantity,
      print_tier: printTier,
      unit_price: tier?.basePrice,
      total_price: parseFloat((tier.basePrice * quantity).toFixed(2)),
      delivery_name: deliveryName,
      delivery_street: deliveryStreet,
      delivery_city: deliveryCity,
      delivery_zip: deliveryZip,
      customer_notification_email: customerNotificationEmail,
      status: "In Bearbeitung",
    });
    if (selectedCaseId) {
      await base44.entities.Case.update(selectedCaseId, { has_card: true, has_order: true });
    }
    setSubmitting(false);
    setOrderDone(true);
  };

  if (orderDone) {
    return (
      <B2BLayout title="Bestellung aufgegeben">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
            <Check className="w-9 h-9" style={{ color: "#4ade80" }} />
          </div>
          <h2 className="text-3xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Bestellung bestätigt</h2>
          <p className="mb-8" style={{ color: "#8a8278" }}>Ihre Bestellung über {quantity} Trauerkarten ({tier?.label}) wurde erfolgreich aufgegeben.</p>
          <button onClick={() => window.location.href = "/B2BOrders"} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            Zu den Bestellungen
          </button>
          <Link to="/B2BCases" className="block text-center mt-3 text-sm" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>Zurück zur Fallübersicht →</Link>
        </div>
      </B2BLayout>
    );
  }

  return (
    <B2BLayout title="Neue Trauerkarte erstellen">
      {/* Wizard steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{
                  background: i < step ? "#c9a96e" : i === step ? "rgba(201,169,110,0.2)" : "rgba(90,85,78,0.2)",
                  color: i < step ? "#0f0e0c" : i === step ? "#c9a96e" : "#5a554e",
                  border: `1px solid ${i <= step ? "#c9a96e" : "#302d28"}`
                }}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-xs sm:text-sm hidden sm:block" style={{ color: i === step ? "#f0ede8" : "#5a554e" }}>{s}</span>
            </div>
            {i < WIZARD_STEPS.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "#302d28" }} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 order-2 lg:order-1">

          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Fall auswählen</h3>
                {cases.length === 0 ? (
                  <p className="text-sm" style={{ color: "#5a554e" }}>Keine aktiven Fälle vorhanden. Bitte zuerst einen Fall anlegen.</p>
                ) : (
                  <div className="space-y-2">
                    {cases.map(c => (
                      <button key={c.id} onClick={() => setSelectedCaseId(c.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left"
                        style={{ background: selectedCaseId === c.id ? "rgba(201,169,110,0.1)" : "#201e1a", border: `1px solid ${selectedCaseId === c.id ? "#c9a96e" : "#302d28"}` }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>{c.deceased_first_name} {c.deceased_last_name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>† {fmtDate(c.date_of_death)} · {c.burial_type}</p>
                        </div>
                        {selectedCaseId === c.id && <Check className="w-4 h-4" style={{ color: "#c9a96e" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Kartenformat</h3>
                <div className="grid grid-cols-2 gap-3">
                  {FORMATS.map(f => (
                    <button key={f.id} onClick={() => setCardFormat(f.id)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{ background: cardFormat === f.id ? "rgba(201,169,110,0.1)" : "#201e1a", border: `1px solid ${cardFormat === f.id ? "#c9a96e" : "#302d28"}` }}>
                      <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>{f.label}</p>
                      <p className="text-xs mt-1" style={{ color: "#5a554e" }}>{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schnellmodus Toggle */}
          {step === 0 && (
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="text-xs" style={{ color: "#8a8278" }}>Modus:</span>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#302d28" }}>
                <button onClick={() => setSchnellmodus(false)}
                  className="px-4 py-2 text-xs font-medium transition-all"
                  style={{ background: !schnellmodus ? "#c9a96e" : "#181714", color: !schnellmodus ? "#0f0e0c" : "#8a8278" }}>
                  Vollständig
                </button>
                <button onClick={() => setSchnellmodus(true)}
                  className="px-4 py-2 text-xs font-medium transition-all"
                  style={{ background: schnellmodus ? "#c9a96e" : "#181714", color: schnellmodus ? "#0f0e0c" : "#8a8278" }}>
                  Schnellmodus
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Questionnaire */}
               {step === 1 && (
                <div className="space-y-4">
                  {schnellmodus ? (
                    <>
                      <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278" }}>Verstorbene Person</label>
                        <input disabled value={selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : ""} 
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-50"
                          style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                      </div>
                      <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278" }}>Kurzbeschreibung (optional)</label>
                        <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2}
                          placeholder="Ein kurzer Satz über die Person genügt"
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                          style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                      </div>
                      <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                        <label className="block text-sm font-medium mb-3" style={{ color: "#8a8278" }}>Motivthema (Außenseite)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {MOTIFS.map(m => (
                            <button key={m.id} onClick={() => setMotif(m.id)}
                              className="p-3 rounded-xl text-center text-xs transition-all"
                              style={{ background: motif === m.id ? `${m.color}20` : "#201e1a", border: `1px solid ${motif === m.id ? m.color : "#302d28"}`, color: motif === m.id ? m.color : "#8a8278" }}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278" }}>Charakterbeschreibung</label>
                    <textarea value={character} onChange={e => setCharacter(e.target.value)} rows={2}
                  placeholder="Z.B. Ein ruhiger Mensch, der immer für andere da war…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278" }}>Beruf / Handwerk (für Motivgestaltung)</label>
                <input value={profession} onChange={e => setProfession(e.target.value)}
                  placeholder="Z.B. Fliesenleger, Bäcker, Lehrerin, Schreiner…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <label className="block text-sm font-medium mb-3" style={{ color: "#8a8278" }}>Leidenschaften & Interessen</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PASSIONS.map(p => (
                    <button key={p} onClick={() => togglePassion(p)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{ background: passions.includes(p) ? "rgba(201,169,110,0.2)" : "#201e1a", border: `1px solid ${passions.includes(p) ? "#c9a96e" : "#302d28"}`, color: passions.includes(p) ? "#c9a96e" : "#8a8278" }}>
                      {p}
                    </button>
                  ))}
                </div>
                <input value={customPassion} onChange={e => setCustomPassion(e.target.value)} placeholder="Weitere Leidenschaft…"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <label className="block text-sm font-medium mb-2" style={{ color: "#8a8278" }}>Lieblingszitat oder Spruch</label>
                <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={2}
                  placeholder="Z.B. »Nicht Weinen, dass es vorbei ist…«"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#8a8278" }}>Ausrichtung</label>
                  {["Christlich", "Evangelisch", "Weltlich", "Spirituell", "Muslimisch"].map(r => (
                    <button key={r} onClick={() => setReligion(r)} className="block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all"
                      style={{ background: religion === r ? "rgba(201,169,110,0.1)" : "transparent", color: religion === r ? "#c9a96e" : "#8a8278", border: `1px solid ${religion === r ? "#c9a96e" : "transparent"}` }}>
                      {r}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#8a8278" }}>Ton der Karte</label>
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} className="block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all"
                      style={{ background: tone === t ? "rgba(201,169,110,0.1)" : "transparent", color: tone === t ? "#c9a96e" : "#8a8278", border: `1px solid ${tone === t ? "#c9a96e" : "transparent"}` }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <label className="block text-sm font-medium mb-3" style={{ color: "#8a8278" }}>Motivthema (Außenseite)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOTIFS.map(m => (
                    <button key={m.id} onClick={() => setMotif(m.id)}
                      className="p-3 rounded-xl text-center text-xs transition-all"
                      style={{ background: motif === m.id ? `${m.color}20` : "#201e1a", border: `1px solid ${motif === m.id ? m.color : "#302d28"}`, color: motif === m.id ? m.color : "#8a8278" }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              </>
              )}
            </div>
          )}

          {/* Step 2 — AI preview */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>KI-generierter Text</h3>
                  <button onClick={generateText} disabled={generating} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all" style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Neu
                  </button>
                </div>
                {generating ? (
                  <div className="space-y-2 py-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-3 rounded-full animate-pulse" style={{ background: "#302d28", width: `${60 + i * 10}%` }} />)}
                    <p className="text-xs text-center pt-2" style={{ color: "#5a554e" }}>KI verfasst Ihren Text…</p>
                  </div>
                ) : (
                  <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={6}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.8 }} />
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium" style={{ color: "#8a8278" }}>KI-generiertes Motiv (Außenseite)</h3>
                  <button onClick={generateMotif} disabled={generatingMotif} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all" style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                    {generatingMotif ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Neu generieren
                  </button>
                </div>
                {generatingMotif ? (
                  <div className="h-40 rounded-xl flex items-center justify-center" style={{ background: "#201e1a" }}>
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "#c9a96e" }} />
                      <p className="text-xs" style={{ color: "#5a554e" }}>Motiv wird generiert…</p>
                    </div>
                  </div>
                ) : generatedMotifUrl ? (
                  <img src={generatedMotifUrl} alt="Motiv" className="w-full h-48 object-cover rounded-xl" />
                ) : null}
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: "#8a8278" }}>Erweiterungen</h3>
                <div className="space-y-3">
                  {[
                    { val: addonInvitation, set: setAddonInvitation, icon: Mail, label: "Einladungskarte", desc: "Separate Karte für die Trauerfeier" },
                    { val: addonThankyou, set: setAddonThankyou, icon: BookOpen, label: "Danksagungskarte", desc: "Für Beileidsbekundungen danken" },
                    { val: addonQr, set: setAddonQr, icon: QrCode, label: "QR-Code zur Gedenkseite", desc: "Verknüpft die Karte mit der digitalen Gedenkseite" },
                  ].map(({ val, set: setter, icon: Icon, label, desc }) => (
                    <button key={label} onClick={() => setter(!val)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left"
                      style={{ background: val ? "rgba(201,169,110,0.08)" : "#201e1a", border: `1px solid ${val ? "#c9a96e" : "#302d28"}` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: val ? "rgba(201,169,110,0.15)" : "#302d28" }}>
                        <Icon className="w-4 h-4" style={{ color: val ? "#c9a96e" : "#5a554e" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>{label}</p>
                        <p className="text-xs" style={{ color: "#5a554e" }}>{desc}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: val ? "#c9a96e" : "#302d28" }}>
                        {val && <Check className="w-3 h-3" style={{ color: "#0f0e0c" }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Print config */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Auflage</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={() => setQuantity(q => Math.max(25, q - 10))} className="w-10 h-10 rounded-xl text-lg flex items-center justify-center" style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>−</button>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.max(25, parseInt(e.target.value) || 25))}
                    className="w-20 text-center py-2.5 rounded-xl text-lg font-semibold outline-none"
                    style={{ background: "#201e1a", border: "1px solid #c9a96e", color: "#f0ede8" }} />
                  <button onClick={() => setQuantity(q => q + 10)} className="w-10 h-10 rounded-xl text-lg flex items-center justify-center" style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>+</button>
                  <span className="text-sm" style={{ color: "#8a8278" }}>Exemplare</span>
                </div>
              </div>

              <div className="space-y-3">
                {PRINT_TIERS.map(t => (
                  <button key={t.id} onClick={() => setPrintTier(t.id)}
                    className="w-full p-4 md:p-5 rounded-2xl text-left transition-all"
                    style={{ background: printTier === t.id ? "rgba(201,169,110,0.08)" : "#181714", border: `1.5px solid ${printTier === t.id ? "#c9a96e" : "#302d28"}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold" style={{ color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif" }}>{t.label}</p>
                        <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>{t.desc}</p>
                        <p className="text-xs mt-1" style={{ color: "#5a554e" }}>Lieferzeit: {t.delivery} · Mind. {t.minQty} Stk.</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold" style={{ color: "#c9a96e" }}>€ {fmtEur(t.basePrice)} / Stk.</p>
                        <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>€ {fmtEur(t.basePrice * quantity)} Karten</p>
                        <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>+ € {fmtEur(t.shipping)} Versand</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl p-5" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.3)" }}>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#8a8278" }}>{quantity} × {tier?.label} Karten</span>
                    <span style={{ color: "#f0ede8" }}>€ {fmtEur(cardsSubtotal)}</span>
                  </div>
                  {addonInvitation && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#8a8278" }}>+ Einladungskarten (€ {fmtEur(ADDON_PRICES.invitation_bundle)}/Stk.)</span>
                      <span style={{ color: "#f0ede8" }}>€ {fmtEur(addonInvPrice)}</span>
                    </div>
                  )}
                  {addonThankyou && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#8a8278" }}>+ Danksagungskarten (€ {fmtEur(ADDON_PRICES.thankyou_bundle)}/Stk.)</span>
                      <span style={{ color: "#f0ede8" }}>€ {fmtEur(addonThkPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#8a8278" }}>Versand ({tier?.label})</span>
                    <span style={{ color: "#f0ede8" }}>€ {fmtEur(shipping)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(201,169,110,0.3)" }}>
                  <span className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Gesamtbetrag</span>
                  <span className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e" }}>€ {totalPrice}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: "#5a554e" }}>Alle Preise zzgl. MwSt. Die KI-Gestaltung und Personalisierung ist im Kartenpreis enthalten.</p>
              </div>
            </div>
          )}

          {/* Step 4 — Order summary */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Delivery mode */}
              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Lieferadresse</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { mode: "funeral_home", icon: Building2, label: "An Bestattungshaus", desc: funeralHome?.name || "Ihre Geschäftsadresse" },
                    { mode: "customer", icon: User, label: "Direkt an Kunden", desc: selectedCase?.next_of_kin_name || "Angehörige/r" },
                  ].map(({ mode, icon: ModeIcon, label, desc }) => (
                    <button key={mode} onClick={() => setDeliveryMode(mode)}
                      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                      style={{ background: deliveryMode === mode ? "rgba(201,169,110,0.1)" : "#201e1a", border: `1.5px solid ${deliveryMode === mode ? "#c9a96e" : "#302d28"}` }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: deliveryMode === mode ? "rgba(201,169,110,0.2)" : "#302d28" }}>
                        <ModeIcon className="w-4 h-4" style={{ color: deliveryMode === mode ? "#c9a96e" : "#5a554e" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>{label}</p>
                        <p className="text-xs truncate" style={{ color: "#5a554e" }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { k: "deliveryName", label: "Empfänger", val: deliveryName, set: setDeliveryName },
                    { k: "deliveryStreet", label: "Straße & Hausnummer", val: deliveryStreet, set: setDeliveryStreet },
                    { k: "deliveryZip", label: "PLZ", val: deliveryZip, set: setDeliveryZip },
                    { k: "deliveryCity", label: "Ort", val: deliveryCity, set: setDeliveryCity },
                  ].map(({ k, label, val, set: setter }) => (
                    <div key={k}>
                      <label className="text-xs mb-1 block" style={{ color: "#8a8278" }}>{label}</label>
                      <input value={val} onChange={e => setter(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer notification email */}
              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Kunden-Benachrichtigung</h3>
                <p className="text-xs mb-4" style={{ color: "#5a554e" }}>Sobald die Karten fertig sind, können Sie dem Kunden per Knopfdruck benachrichtigen.</p>
                <label className="text-xs mb-1 block" style={{ color: "#8a8278" }}>E-Mail-Adresse des Kunden (optional)</label>
                <input
                  type="email"
                  value={customerNotificationEmail}
                  onChange={e => setCustomerNotificationEmail(e.target.value)}
                  placeholder="kunde@beispiel.de"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}
                />
                {selectedCase?.next_of_kin_email && !customerNotificationEmail && (
                  <button
                    onClick={() => setCustomerNotificationEmail(selectedCase.next_of_kin_email)}
                    className="mt-2 text-xs"
                    style={{ color: "#c9a96e" }}
                  >
                    Aus Fall übernehmen: {selectedCase.next_of_kin_email}
                  </button>
                )}
              </div>

              <div className="rounded-2xl p-5 md:p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Bestellübersicht</h3>
                {[
                  ["Fall", selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : "—"],
                  ["Format", FORMATS.find(f => f.id === cardFormat)?.label || "—"],
                  ["Motiv", MOTIFS.find(m => m.id === motif)?.label || "—"],
                  ["Drucktier", tier?.label || "—"],
                  ["Auflage", `${quantity} Stk.`],
                  ["Karten", `€ ${fmtEur(cardsSubtotal)}`],
                  ...(addonInvitation ? [["+ Einladungskarten", `€ ${fmtEur(addonInvPrice)}`]] : []),
                  ...(addonThankyou ? [["+ Danksagungskarten", `€ ${fmtEur(addonThkPrice)}`]] : []),
                  ...(addonQr ? [["+ QR-Code", "Ja"]] : []),
                  ["Versand", `€ ${fmtEur(shipping)}`],
                  ...(customerNotificationEmail ? [["Kunden-E-Mail", customerNotificationEmail]] : []),
                  ["Gesamtbetrag (netto)", `€ ${totalPrice}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b text-sm last:border-0" style={{ borderColor: "#302d28" }}>
                    <span style={{ color: "#8a8278" }}>{label}</span>
                    <span style={{ color: label.startsWith("Gesamt") ? "#c9a96e" : "#f0ede8", fontWeight: label.startsWith("Gesamt") ? 600 : 400 }}>{val}</span>
                  </div>
                ))}
                <p className="text-xs mt-3 pt-3 border-t" style={{ color: "#5a554e", borderColor: "#302d28" }}>
                  Alle Preise zzgl. MwSt. Die KI-Gestaltung und Personalisierung ist im Kartenpreis enthalten.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>
                Zurück
              </button>
            )}
            {step === 2 && (
              <button onClick={async () => {
                await base44.entities.MourningCard.create({ case_id: selectedCaseId, format: cardFormat, generated_text: editedText, motif_image_url: generatedMotifUrl, motif_theme: motif, questionnaire_answers: JSON.stringify({ character, passions, quote, religion, tone, profession }), addon_invitation: addonInvitation, addon_thankyou: addonThankyou, addon_qr: addonQr, status: "entwurf" });
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2000);
              }} className="px-4 py-3 rounded-xl text-sm border flex-shrink-0" style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
                {draftSaved ? "Entwurf gespeichert ✓" : "Entwurf speichern"}
              </button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !selectedCaseId}
                className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-40" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                Weiter
              </button>
            ) : (
              <button onClick={submitOrder} disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Bestellung aufgeben
              </button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="lg:sticky lg:top-8">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs uppercase tracking-widest" style={{ color: "#5a554e" }}>Vorschau</p>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#302d28" }}>
                {["front", "inside"].map(side => (
                  <button key={side} onClick={() => setPreviewSide(side)}
                    className="px-3 py-1.5 text-xs transition-all"
                    style={{ background: previewSide === side ? "#c9a96e" : "#181714", color: previewSide === side ? "#0f0e0c" : "#8a8278" }}>
                    {side === "front" ? "Außen" : "Innen"}
                  </button>
                ))}
              </div>
            </div>
            <CardPrintPreview
              caseData={selectedCase}
              generatedText={editedText}
              motif={motif}
              motifImageUrl={generatedMotifUrl}
              cardFormat={cardFormat}
              side={previewSide}
              funeralHome={funeralHome}
            />
          </div>
        </div>
      </div>
    </B2BLayout>
  );
}