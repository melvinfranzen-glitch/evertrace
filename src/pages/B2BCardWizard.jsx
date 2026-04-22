import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Check, ChevronRight, Loader2, QrCode, Mail, BookOpen, Building2, User, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PRINT_TIERS as TIER_DATA, ADDON_PRICES, DEFAULT_CARD_QUANTITY, fmtEur } from "@/components/pricing/pricingData";

const PRINT_TIERS = TIER_DATA;

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

const WIZARD_STEPS = ["Fall & Format", "Designs wählen", "Druckkonfiguration", "Bestellung"];

// 4 distinct card design styles for AI generation
const DESIGN_STYLES = [
  {
    id: "classic_dark",
    label: "Klassisch",
    promptStyle: "Ultra-elegant dark mourning card design. Deep charcoal (#1a1714) background with subtle warm undertones. Delicate botanical illustration — single lily or rose branch in pale gold (#c9a96e) ink, fine line art style, placed asymmetrically. Centered serif typography area. Gold ornamental divider lines top and bottom. Sophisticated, timeless, formal.",
  },
  {
    id: "nature_warm",
    label: "Natur",
    promptStyle: "Warm nature-inspired mourning card. Soft dark olive-green to near-black gradient background. Detailed hand-drawn botanical motif — oak leaves, ferns or wildflowers in muted gold and sage tones, flowing organically around the edges. Earthy, peaceful, organic feeling. Typography centered with generous breathing room.",
  },
  {
    id: "minimal_modern",
    label: "Modern",
    promptStyle: "Minimalist contemporary mourning card. Pure near-black (#0f0e0c) background. Single ultra-thin geometric element — delicate circle or horizontal gold line with a tiny decorative cross or star. No clutter. Maximum whitespace. Fine sans-serif typography layout area. Cold, clean, architectural elegance.",
  },
  {
    id: "spiritual_soft",
    label: "Spiritual",
    promptStyle: "Soft spiritual mourning card. Very dark navy-to-black gradient background with barely visible light rays or aurora effect. Gentle watercolor-style motif — dove, light beam or abstract angel wings in white-gold, semi-transparent layers. Ethereal, hopeful, comforting atmosphere. Typography centered with soft glow.",
  },
];

export default function B2BCardWizard() {
  const params = new URLSearchParams(window.location.search);
  const preselectedCaseId = params.get("case_id");

  const [step, setStep] = useState(0);
  const [cases, setCases] = useState([]);
  const [funeralHome, setFuneralHome] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || "");
  const [selectedCase, setSelectedCase] = useState(null);
  const [cardFormat, setCardFormat] = useState("DIN_A6_landscape");
  const [extraInfo, setExtraInfo] = useState("");

  // 4 generated designs
  const [designs, setDesigns] = useState([null, null, null, null]); // each: { imageUrl, text }
  const [generatingDesigns, setGeneratingDesigns] = useState(false);
  const [selectedDesignIdx, setSelectedDesignIdx] = useState(null);
  const [regeneratingIdx, setRegeneratingIdx] = useState(null);

  // Chosen design editable text
  const [editedText, setEditedText] = useState("");

  // Addons
  const [addonInvitation, setAddonInvitation] = useState(false);
  const [addonThankyou, setAddonThankyou] = useState(false);
  const [addonQr, setAddonQr] = useState(false);

  // Print config
  const [quantity, setQuantity] = useState(DEFAULT_CARD_QUANTITY);
  const [printTier, setPrintTier] = useState("standard");

  // Delivery
  const [deliveryMode, setDeliveryMode] = useState("funeral_home");
  const [customerNotificationEmail, setCustomerNotificationEmail] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
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

  const buildPersonContext = () => {
    const c = selectedCase;
    const name = c ? `${c.deceased_first_name} ${c.deceased_last_name}` : "Unbekannte Person";
    const born = c?.date_of_birth ? fmtDate(c.date_of_birth) : "";
    const died = c?.date_of_death ? fmtDate(c.date_of_death) : "";
    const burial = c?.burial_type || "";
    return { name, born, died, burial };
  };

  const generateOneDesign = async (styleIdx) => {
    const { name, born, died, burial } = buildPersonContext();
    const style = DESIGN_STYLES[styleIdx];

    // Generate image and text in parallel
    const imagePrompt = `A complete mourning card design ready for print. Full-bleed artwork filling the entire card. ${style.promptStyle} The card should have clearly visible text overlay areas. Person: ${name}${born ? `, born ${born}` : ""}${died ? `, died ${died}` : ""}${burial ? `, ${burial}` : ""}. ${extraInfo ? `Additional context: ${extraInfo}.` : ""} The name "${name}" and dates should appear elegant on the card as text overlays. NO placeholder text, just the visual design background. High resolution, print quality, realistic card mockup perspective.`;

    const textPrompt = `Du bist ein erfahrener Texter für Trauerkarten. Schreibe einen würdevollen, persönlichen Trauerkartentext auf Deutsch für ${name}${born ? ` (* ${born})` : ""}${died ? ` († ${died})` : ""}${burial ? `, ${burial}` : ""}.${extraInfo ? ` Zusätzliche Informationen: ${extraInfo}.` : ""}

Stil: ${style.label}. Der Text soll 60–90 Wörter lang sein, druckfertig, kein Boilerplate. Klingt als hätte ihn jemand geschrieben der die Person wirklich kannte.`;

    const [imgResult, textResult] = await Promise.all([
      base44.integrations.Core.GenerateImage({ prompt: imagePrompt }),
      base44.integrations.Core.InvokeLLM({ prompt: textPrompt, model: "claude_sonnet_4_6" }),
    ]);

    return {
      imageUrl: imgResult.url,
      text: typeof textResult === "string" ? textResult : "",
      style: style.id,
      styleLabel: style.label,
    };
  };

  const generateAllDesigns = async () => {
    setGeneratingDesigns(true);
    setDesigns([null, null, null, null]);
    setSelectedDesignIdx(null);

    // Generate all 4 in parallel
    const results = await Promise.all(DESIGN_STYLES.map((_, i) => generateOneDesign(i)));
    setDesigns(results);
    setGeneratingDesigns(false);
  };

  const regenerateSingle = async (idx) => {
    setRegeneratingIdx(idx);
    const result = await generateOneDesign(idx);
    setDesigns(prev => {
      const next = [...prev];
      next[idx] = result;
      return next;
    });
    if (selectedDesignIdx === idx) setEditedText(result.text);
    setRegeneratingIdx(null);
  };

  // Trigger generation when entering step 1
  useEffect(() => {
    if (step === 1 && designs.every(d => d === null) && !generatingDesigns) {
      generateAllDesigns();
    }
  }, [step]);

  const selectDesign = (idx) => {
    setSelectedDesignIdx(idx);
    setEditedText(designs[idx]?.text || "");
  };

  const tier = PRINT_TIERS.find(t => t.id === printTier);
  const addonInvPrice = addonInvitation ? ADDON_PRICES.invitation_bundle * quantity : 0;
  const addonThkPrice = addonThankyou ? ADDON_PRICES.thankyou_bundle * quantity : 0;
  const cardsSubtotal = tier ? tier.basePrice * quantity : 0;
  const shipping = tier ? tier.shipping : 0;
  const totalPrice = fmtEur(cardsSubtotal + addonInvPrice + addonThkPrice + shipping);

  const submitOrder = async () => {
    setSubmitting(true);
    const chosen = designs[selectedDesignIdx];
    const card = await base44.entities.MourningCard.create({
      case_id: selectedCaseId,
      format: cardFormat,
      questionnaire_answers: JSON.stringify({ extraInfo, style: chosen?.style }),
      generated_text: editedText,
      motif_theme: chosen?.style || "minimalist",
      motif_image_url: chosen?.imageUrl || "",
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
          <button onClick={() => { window.location.replace("/B2BOrders"); }} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            Zu den Bestellungen
          </button>
          <Link to="/B2BCases" className="block text-center mt-3 text-sm" style={{ color: "#8a8278" }}>Zurück zur Fallübersicht →</Link>
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

      {/* ── Step 0: Fall & Format ── */}
      {step === 0 && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
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
                      <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>
                        {c.date_of_birth && `* ${fmtDate(c.date_of_birth)}`}
                        {c.date_of_birth && c.date_of_death && " · "}
                        {c.date_of_death && `† ${fmtDate(c.date_of_death)}`}
                        {c.burial_type && ` · ${c.burial_type}`}
                      </p>
                    </div>
                    {selectedCaseId === c.id && <Check className="w-4 h-4" style={{ color: "#c9a96e" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
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

          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Zusätzliche Informationen</h3>
            <p className="text-xs mb-4" style={{ color: "#5a554e" }}>
              Optional — Alles was die KI wissen sollte: Beruf, Leidenschaften, Charakter, Zitate, religiöse Ausrichtung, besondere Wünsche der Familie.
            </p>
            <textarea
              value={extraInfo}
              onChange={e => setExtraInfo(e.target.value)}
              rows={4}
              placeholder="z. B. „War Schreiner und liebte die Natur. Gläubige Katholikin. Lieblingszitat: ..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", lineHeight: 1.7 }}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => { setDesigns([null, null, null, null]); setStep(1); }}
              disabled={!selectedCaseId}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              <Sparkles className="w-4 h-4" /> 4 Designs generieren lassen
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Design auswählen ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                Wählen Sie Ihr Design
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>
                Jedes Design wurde speziell für {selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : "diese Person"} generiert.
              </p>
            </div>
            {!generatingDesigns && (
              <button onClick={generateAllDesigns}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                <RefreshCw className="w-3.5 h-3.5" /> Alle neu generieren
              </button>
            )}
          </div>

          {generatingDesigns && designs.every(d => d === null) ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DESIGN_STYLES.map((style, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#181714", border: "1px solid #302d28" }}>
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3" style={{ background: "#201e1a" }}>
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#c9a96e" }} />
                    <p className="text-xs" style={{ color: "#5a554e" }}>{style.label}</p>
                    <p className="text-xs" style={{ color: "#302d28" }}>wird generiert…</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium" style={{ color: "#5a554e" }}>{style.label}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DESIGN_STYLES.map((style, i) => {
                const design = designs[i];
                const isSelected = selectedDesignIdx === i;
                const isRegen = regeneratingIdx === i;
                return (
                  <div key={i} className="rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all"
                    style={{ background: "#181714", border: `2px solid ${isSelected ? "#c9a96e" : "#302d28"}`, transform: isSelected ? "scale(1.02)" : "scale(1)" }}
                    onClick={() => design && !isRegen && selectDesign(i)}>

                    <div className="aspect-[3/4] relative overflow-hidden" style={{ background: "#201e1a" }}>
                      {isRegen ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10" style={{ background: "rgba(15,14,12,0.85)" }}>
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#c9a96e" }} />
                          <p className="text-xs" style={{ color: "#5a554e" }}>neu generieren…</p>
                        </div>
                      ) : null}

                      {design?.imageUrl ? (
                        <img src={design.imageUrl} alt={style.label} className="w-full h-full object-cover" />
                      ) : !isRegen ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#c9a96e" }} />
                          <p className="text-xs" style={{ color: "#5a554e" }}>{style.label}…</p>
                        </div>
                      ) : null}

                      {/* Selection overlay */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#c9a96e" }}>
                          <Check className="w-4 h-4" style={{ color: "#0f0e0c" }} />
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: isSelected ? "#c9a96e" : "#f0ede8" }}>{style.label}</p>
                      </div>
                      {design && (
                        <button
                          onClick={e => { e.stopPropagation(); regenerateSingle(i); }}
                          disabled={isRegen || !!regeneratingIdx}
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                          style={{ background: "#302d28" }}
                          title="Neu generieren">
                          <RefreshCw className="w-3 h-3" style={{ color: "#8a8278" }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text editor for selected design */}
          {selectedDesignIdx !== null && designs[selectedDesignIdx] && (
            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-base font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                Trauertext — {DESIGN_STYLES[selectedDesignIdx].label}
              </h3>
              <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.8 }} />

              {/* Addons */}
              <div className="mt-4 space-y-2">
                <p className="text-xs mb-2" style={{ color: "#5a554e" }}>Erweiterungen</p>
                {[
                  { val: addonInvitation, set: setAddonInvitation, icon: Mail, label: "Einladungskarte" },
                  { val: addonThankyou, set: setAddonThankyou, icon: BookOpen, label: "Danksagungskarte" },
                  { val: addonQr, set: setAddonQr, icon: QrCode, label: "QR-Code zur Gedenkseite" },
                ].map(({ val, set: setter, icon: Icon, label }) => (
                  <button key={label} onClick={() => setter(!val)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                    style={{ background: val ? "rgba(201,169,110,0.08)" : "#201e1a", border: `1px solid ${val ? "#c9a96e" : "#302d28"}` }}>
                    <Icon className="w-4 h-4" style={{ color: val ? "#c9a96e" : "#5a554e" }} />
                    <span className="text-sm flex-1" style={{ color: "#f0ede8" }}>{label}</span>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: val ? "#c9a96e" : "#302d28" }}>
                      {val && <Check className="w-2.5 h-2.5" style={{ color: "#0f0e0c" }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>
              Zurück
            </button>
            <button
              onClick={async () => {
                await base44.entities.MourningCard.create({
                  case_id: selectedCaseId, format: cardFormat,
                  generated_text: editedText, motif_image_url: designs[selectedDesignIdx]?.imageUrl || "",
                  motif_theme: designs[selectedDesignIdx]?.style || "minimalist",
                  questionnaire_answers: JSON.stringify({ extraInfo }),
                  addon_invitation: addonInvitation, addon_thankyou: addonThankyou, addon_qr: addonQr, status: "entwurf",
                });
                setDraftSaved(true); setTimeout(() => setDraftSaved(false), 2500);
              }}
              className="px-4 py-3 rounded-xl text-sm border flex-shrink-0"
              style={{ borderColor: "#c9a96e", color: draftSaved ? "#4ade80" : "#c9a96e", borderColor: draftSaved ? "#4ade80" : "#c9a96e" }}>
              {draftSaved ? "✓ Entwurf gespeichert" : "Entwurf speichern"}
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={selectedDesignIdx === null || generatingDesigns}
              className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              Weiter zum Druck
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Print config ── */}
      {step === 2 && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Auflage</h3>
            <div className="flex items-center gap-4">
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
                className="w-full p-5 rounded-2xl text-left transition-all"
                style={{ background: printTier === t.id ? "rgba(201,169,110,0.08)" : "#181714", border: `1.5px solid ${printTier === t.id ? "#c9a96e" : "#302d28"}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold" style={{ color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif" }}>{t.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>{t.desc}</p>
                    <p className="text-xs mt-1" style={{ color: "#5a554e" }}>Lieferzeit: {t.delivery} · Mind. {t.minQty} Stk.</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold" style={{ color: "#c9a96e" }}>€ {fmtEur(t.basePrice)} / Stk.</p>
                    <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>€ {fmtEur(t.basePrice * quantity)} gesamt</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>+ € {fmtEur(t.shipping)} Versand</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.3)" }}>
            <div className="flex items-center justify-between pt-3">
              <span className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Gesamtbetrag</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e" }}>€ {totalPrice}</span>
            </div>
            <p className="text-xs mt-2" style={{ color: "#5a554e" }}>Alle Preise zzgl. MwSt.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Zurück</button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter zur Bestellung</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Lieferung & Bestellung ── */}
      {step === 3 && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
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

          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Kunden-Benachrichtigung</h3>
            <p className="text-xs mb-4" style={{ color: "#5a554e" }}>Optional — E-Mail-Adresse für Statusbenachrichtigungen.</p>
            <input type="email" value={customerNotificationEmail} onChange={e => setCustomerNotificationEmail(e.target.value)}
              placeholder="kunde@beispiel.de" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
            {selectedCase?.next_of_kin_email && !customerNotificationEmail && (
              <button onClick={() => setCustomerNotificationEmail(selectedCase.next_of_kin_email)}
                className="mt-2 text-xs" style={{ color: "#c9a96e" }}>
                Aus Fall übernehmen: {selectedCase.next_of_kin_email}
              </button>
            )}
          </div>

          {/* Bestellübersicht */}
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Bestellübersicht</h3>
            {[
              ["Design", DESIGN_STYLES[selectedDesignIdx]?.label || "—"],
              ["Format", FORMATS.find(f => f.id === cardFormat)?.label || "—"],
              ["Drucktier", tier?.label || "—"],
              ["Auflage", `${quantity} Stk.`],
              ["Karten", `€ ${fmtEur(cardsSubtotal)}`],
              ...(addonInvitation ? [["+ Einladungskarten", `€ ${fmtEur(addonInvPrice)}`]] : []),
              ...(addonThankyou ? [["+ Danksagungskarten", `€ ${fmtEur(addonThkPrice)}`]] : []),
              ...(addonQr ? [["+ QR-Code", "Ja"]] : []),
              ["Versand", `€ ${fmtEur(shipping)}`],
              ["Gesamtbetrag (netto)", `€ ${totalPrice}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b text-sm last:border-0" style={{ borderColor: "#302d28" }}>
                <span style={{ color: "#8a8278" }}>{label}</span>
                <span style={{ color: label.startsWith("Gesamt") ? "#c9a96e" : "#f0ede8", fontWeight: label.startsWith("Gesamt") ? 600 : 400 }}>{val}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Zurück</button>
            <button onClick={submitOrder} disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Bestellung aufgeben
            </button>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}