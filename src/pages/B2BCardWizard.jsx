import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import {
  Check, ChevronRight, Loader2, QrCode, Mail, BookOpen,
  Building2, User, RefreshCw, Sparkles, Camera, ImageIcon, Monitor
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PRINT_TIERS as TIER_DATA, ADDON_PRICES, DEFAULT_CARD_QUANTITY, fmtEur } from "@/components/pricing/pricingData";
import CardPrintPreview from "@/components/b2b/CardPrintPreview";
import CardPdfExport from "@/components/b2b/CardPdfExport";

const PRINT_TIERS = TIER_DATA;

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const FORMATS = [
  { id: "DIN_A5_folded", label: "DIN A5 gefaltet", desc: "148 × 210 mm, 4-seitig · Standard" },
  { id: "DIN_A6_landscape", label: "DIN A6 quer", desc: "148 × 105 mm" },
  { id: "DIN_lang_portrait", label: "DIN lang", desc: "99 × 210 mm" },
  { id: "Leporello", label: "Leporello", desc: "Faltformat, mehrere Seiten" },
];

const WIZARD_STEPS = ["Fall & Foto", "Text generieren", "Druckkonfiguration", "Bestellung"];

const MOTIF_PROMPTS = {
  nature: "Serene misty forest path at dawn, soft golden light filtering through ancient trees, ethereal morning atmosphere, rich green tones",
  floral_classic: "Elegant white roses and lilies arrangement on dark background, soft bokeh, muted warm tones, classical composition",
  religious: "Peaceful church interior with warm candlelight glow, stained glass window colors, serene and sacred atmosphere",
  maritime: "Calm ocean horizon at golden hour, gentle waves reflecting sunlight, dramatic peaceful sky",
  forest: "Ancient solitary oak tree in morning fog, dramatic soft lighting, peaceful meadow, timeless mood",
  handwerk: "Rustic workshop detail, warm aged wood textures, soft natural sidelight, nostalgic artisan mood",
  minimalist: "Minimalist misty mountain landscape at dawn, soft pastel tones, peaceful silence, elegant simplicity",
};

export default function B2BCardWizard() {
  const params = new URLSearchParams(window.location.search);
  const preselectedCaseId = params.get("case_id");
  const draftId = params.get("draft_id");

  const [step, setStep] = useState(0);
  const [draftCardId, setDraftCardId] = useState(draftId || null);
  const [cases, setCases] = useState([]);
  const [funeralHome, setFuneralHome] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId || "");
  const [selectedCase, setSelectedCase] = useState(null);
  const [cardFormat, setCardFormat] = useState("DIN_A5_folded");
  const [extraInfo, setExtraInfo] = useState("");
  const [religion, setReligion] = useState("Weltlich");

  // Photo for front
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // 4 personalized designs
  const [designs, setDesigns] = useState([]); // [{motifUrl, label}]
  const [selectedDesignIdx, setSelectedDesignIdx] = useState(0);
  const [generatingDesigns, setGeneratingDesigns] = useState(false);
  const [personContext, setPersonContext] = useState("");
  const [motifTheme, setMotifTheme] = useState("nature");
  const [motifImageUrl, setMotifImageUrl] = useState("");

  // Text generation
  const [generatedText, setGeneratedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [generatingText, setGeneratingText] = useState(false);

  // Preview side
  const [previewSide, setPreviewSide] = useState("front");

  // Addons
  const [addonInvitation, setAddonInvitation] = useState(false);
  const [addonThankyou, setAddonThankyou] = useState(false);
  const [addonQr, setAddonQr] = useState(false);

  // Print config
  const [quantity, setQuantity] = useState(DEFAULT_CARD_QUANTITY);
  const [printTier, setPrintTier] = useState("standard");
  const [printMode, setPrintMode] = useState("order"); // "order" | "self"

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
  const [presentationId, setPresentationId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.Case.filter({ created_by: u.email, status: "aktiv" }, "-created_date").then(setCases);
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(([h]) => {
        if (h) setFuneralHome(h);
      });
    });
  }, []);

  // Load draft if draft_id is in URL
  useEffect(() => {
    if (!draftId) return;
    base44.entities.MourningCard.filter({ id: draftId }).then(([card]) => {
      if (!card) return;
      setDraftCardId(card.id);
      setSelectedCaseId(card.case_id || "");
      setCardFormat(card.format || "DIN_A5_folded");
      setEditedText(card.generated_text || "");
      setGeneratedText(card.generated_text || "");
      setAddonInvitation(card.addon_invitation || false);
      setAddonThankyou(card.addon_thankyou || false);
      setAddonQr(card.addon_qr || false);
      if (card.motif_image_url) setHeroImageUrl(card.motif_image_url);
      try {
        const qa = JSON.parse(card.questionnaire_answers || "{}");
        if (qa.extraInfo) setExtraInfo(qa.extraInfo);
        if (qa.religion) setReligion(qa.religion);
        if (qa.heroImageUrl) setHeroImageUrl(qa.heroImageUrl);
        if (qa.designs) setDesigns(qa.designs);
        if (qa.selectedDesignIdx !== undefined) setSelectedDesignIdx(qa.selectedDesignIdx);
      } catch {}
      // Go to step 1 directly since we already have text
      setStep(1);
    });
  }, [draftId]);

  // When case is selected, load photo + person context from linked pages
  useEffect(() => {
    if (selectedCaseId && cases.length) {
      const c = cases.find(x => x.id === selectedCaseId);
      setSelectedCase(c || null);
      if (c) {
        // Don't reset if we loaded from a draft (draft sets heroImageUrl/designs itself)
        if (!draftId) {
          setHeroImageUrl("");
          setPersonContext("");
          setDesigns([]);
          // Try B2BMemorialPage first
          base44.entities.B2BMemorialPage.filter({ case_id: c.id })
            .then(([page]) => {
              if (page?.main_photo_url) setHeroImageUrl(page.main_photo_url);
              if (page?.biography) setPersonContext(page.biography);
            }).catch(() => {});
          // Also try linked Memorial via funeral_home_case_id
          base44.entities.Memorial.filter({ funeral_home_case_id: c.id })
            .then(([m]) => {
              if (m?.hero_image_url) setHeroImageUrl(prev => prev || m.hero_image_url);
              if (m?.biography_raw_input) setPersonContext(prev => prev || m.biography_raw_input);
              else if (m?.biography) setPersonContext(prev => prev || m.biography);
            }).catch(() => {});
        }
      }
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

  const generateFourDesigns = async () => {
    setGeneratingDesigns(true);
    const { name } = buildPersonContext();
    const info = [personContext, extraInfo].filter(Boolean).join(" ");

    // Ask Claude to generate 4 personalized scene descriptions
    const scenePrompt = `Du bist ein kreativer Art Director für Trauerkarten. Basierend auf diesen Informationen über die verstorbene Person:

Name: ${name}
${extraInfo ? `Informationen: ${extraInfo}` : ""}
${personContext ? `Biografie/Hintergrund: ${personContext.slice(0, 400)}` : ""}
Religiöse Ausrichtung: ${religion}

Erstelle 4 VERSCHIEDENE kurze englische Foto-Szenen für die Außenseite einer Trauerkarte. Jede Szene soll zur Person passen. Keine Menschen, keine Gesichter, kein Text im Bild.

Antworte NUR mit einem JSON-Array (kein anderer Text):
[{"scene":"kurze englische Szene-Beschreibung","label":"kurzer deutscher Titel"},...]`;

    let scenes = [];
    try {
      const raw = await base44.integrations.Core.InvokeLLM({ prompt: scenePrompt, model: "claude_sonnet_4_6" });
      const cleaned = (typeof raw === "string" ? raw : "").replace(/```json|```/g, "").trim();
      scenes = JSON.parse(cleaned);
    } catch {
      scenes = [
        { scene: "serene misty forest at dawn, golden light through ancient trees, peaceful path", label: "Waldlichtung" },
        { scene: "calm lake at sunset, mirror reflection, warm golden light, peaceful atmosphere", label: "Stiller See" },
        { scene: "single ancient oak tree in autumn, golden leaves, soft morning mist", label: "Herbstbaum" },
        { scene: "soft white roses close-up, morning dew drops, shallow depth of field, warm tones", label: "Weiße Rosen" },
      ];
    }

    // Generate all 4 images in parallel
    const results = await Promise.all(scenes.slice(0, 4).map(async (s) => {
      const prompt = `Fine art photography, ${s.scene}. Flat 2D image filling the entire frame edge to edge. Photorealistic, high resolution, moody, contemplative. Vertical portrait orientation. Absolutely NO text, NO letters, NO numbers, NO watermarks, NO borders, NO 3D objects, NO paper, NO mockup, NO product photography. Just a beautiful flat photograph.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      return { motifUrl: url, label: s.label };
    }));

    setDesigns(results);
    setSelectedDesignIdx(0);
    setGeneratingDesigns(false);
  };

  const generateText = async () => {
    const { name, born, died, burial } = buildPersonContext();
    setGeneratingText(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist ein erfahrener Texter für Trauerkarten. Schreibe einen würdevollen, persönlichen Trauerkartentext auf Deutsch für ${name}${born ? ` (* ${born})` : ""}${died ? ` († ${died})` : ""}${burial ? `, ${burial}` : ""}.${extraInfo ? ` Zusätzliche Informationen vom Bestatter: ${extraInfo}.` : ""}${religion && religion !== "Weltlich" ? ` Religiöse Ausrichtung: ${religion}.` : ""}

Der Text soll 60–90 Wörter lang sein, druckfertig, persönlich und würdevoll. Klingt als hätte ihn jemand geschrieben der die Person wirklich kannte. Keine Floskeln, keine Boilerplate. Direkt beginnen.`,
      model: "claude_sonnet_4_6",
    });
    const text = typeof result === "string" ? result : "";
    setGeneratedText(text);
    setEditedText(text);
    setGeneratingText(false);
  };

  // Trigger generation when entering step 1
  useEffect(() => {
    if (step === 1) {
      if (!generatedText && !generatingText) generateText();
      if (!heroImageUrl && designs.length === 0 && !generatingDesigns) generateFourDesigns();
    }
  }, [step]);

  // Sync to presentation when key state changes
  useEffect(() => {
    if (!presentationId) return;
    syncPresentation();
  }, [selectedDesignIdx, editedText, previewSide, designs, step, heroImageUrl]);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setHeroImageUrl(file_url);
    setUploadingPhoto(false);
    e.target.value = "";
  };

  const tier = PRINT_TIERS.find(t => t.id === printTier);
  const addonInvPrice = addonInvitation ? ADDON_PRICES.invitation_bundle * quantity : 0;
  const addonThkPrice = addonThankyou ? ADDON_PRICES.thankyou_bundle * quantity : 0;
  const cardsSubtotal = tier ? tier.basePrice * quantity : 0;
  const shipping = tier ? tier.shipping : 0;
  const totalPrice = fmtEur(cardsSubtotal + addonInvPrice + addonThkPrice + shipping);

  // Auto-scroll to top on step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // Sync presentation state
  const syncPresentation = async (overrides = {}) => {
    const payload = {
      wizard_user_id: (await base44.auth.me()).id || "",
      case_id: selectedCaseId,
      funeral_home_id: funeralHome?.id || "",
      hero_image_url: heroImageUrl,
      selected_design_idx: selectedDesignIdx,
      designs,
      edited_text: editedText,
      card_format: cardFormat,
      preview_side: previewSide,
      religion,
      step,
      ...overrides,
    };
    if (presentationId) {
      await base44.entities.PresentationState.update(presentationId, payload);
    } else {
      const created = await base44.entities.PresentationState.create(payload);
      setPresentationId(created.id);
      return created.id;
    }
    return presentationId;
  };

  const openPresentation = async () => {
    const id = await syncPresentation();
    window.open(`/B2BCardPresentation?id=${id}`, "_blank", "noopener");
  };

  const submitOrder = async () => {
    setSubmitting(true);
    const card = await base44.entities.MourningCard.create({
      case_id: selectedCaseId,
      format: cardFormat,
      questionnaire_answers: JSON.stringify({ extraInfo, religion, motifTheme, heroImageUrl }),
      generated_text: editedText,
      motif_theme: motifTheme,
      motif_image_url: heroImageUrl || designs[selectedDesignIdx]?.motifUrl || "",
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
      {/* Wizard step indicators + Präsentations-Button */}
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
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
        {step >= 1 && (
          <button
            onClick={openPresentation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-all"
            style={{ background: presentationId ? "rgba(201,169,110,0.15)" : "#201e1a", border: `1px solid ${presentationId ? "#c9a96e" : "#302d28"}`, color: presentationId ? "#c9a96e" : "#8a8278" }}
          >
            <Monitor className="w-4 h-4" />
            {presentationId ? "TV-Ansicht aktualisieren" : "Präsentationsmodus"}
          </button>
        )}
      </div>

      {/* ── Step 0: Fall, Foto & Format ── */}
      {step === 0 && (
        <div className="max-w-2xl space-y-5">
          {/* Fall auswählen */}
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

          {/* Foto für Außenseite */}
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Foto für Außenseite</h3>
            <p className="text-xs mb-4" style={{ color: "#5a554e" }}>
              Das Portrait wird als Vollformat-Hintergrundbild der Außenseite verwendet. Wenn kein Foto vorhanden, wird ein stimmungsvolles Motivbild generiert.
            </p>
            {heroImageUrl ? (
              <div className="flex items-center gap-4">
                <img src={heroImageUrl} alt="" className="w-20 h-28 rounded-xl object-cover flex-shrink-0" style={{ objectPosition: "center 25%" }} />
                <div>
                  <p className="text-xs mb-2" style={{ color: "#4ade80" }}>✓ Foto wird als Außenseite verwendet</p>
                  <p className="text-xs mb-3" style={{ color: "#5a554e" }}>Das Foto wird mit einem eleganten Textverlauf überlagert.</p>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg" style={{ background: "#302d28", color: "#c9a96e" }}>
                      {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                      Ändern
                      <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploadingPhoto} />
                    </label>
                    <button onClick={() => setHeroImageUrl("")} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#201e1a", color: "#5a554e" }}>
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 py-5 rounded-xl cursor-pointer transition-all"
                  style={{ border: "2px dashed #302d28", color: "#5a554e" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c9a96e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#302d28"}>
                  {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#c9a96e" }} /> : <Camera className="w-5 h-5" />}
                  <span className="text-sm">Portrait hochladen (empfohlen)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploadingPhoto} />
                </label>
                <div className="flex items-center gap-2">
                  <div style={{ flex: 1, height: 1, background: "#302d28" }} />
                  <span className="text-xs" style={{ color: "#5a554e" }}>oder Motivbild generieren</span>
                  <div style={{ flex: 1, height: 1, background: "#302d28" }} />
                </div>
                {/* Motif theme selector */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(MOTIF_PROMPTS).map(theme => (
                    <button key={theme} onClick={() => setMotifTheme(theme)}
                      className="px-3 py-2 rounded-lg text-xs text-center transition-all capitalize"
                      style={{
                        background: motifTheme === theme ? "rgba(201,169,110,0.12)" : "#201e1a",
                        border: `1px solid ${motifTheme === theme ? "#c9a96e" : "#302d28"}`,
                        color: motifTheme === theme ? "#c9a96e" : "#8a8278",
                      }}>
                      {theme === "floral_classic" ? "Blumen" : theme === "maritime" ? "See" : theme === "handwerk" ? "Handwerk" : theme === "religious" ? "Religiös" : theme === "minimalist" ? "Minimalistisch" : theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#5a554e" }}>Das Motivbild wird im nächsten Schritt automatisch generiert.</p>
              </div>
            )}
          </div>

          {/* Kartenformat */}
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

          {/* Informationen für die KI */}
          <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Informationen für den Text</h3>
            <p className="text-xs mb-4" style={{ color: "#5a554e" }}>
              Alles was die KI wissen sollte: Beruf, Leidenschaften, Charakter, Zitate, besondere Wünsche der Familie.
            </p>
            <textarea
              value={extraInfo}
              onChange={e => setExtraInfo(e.target.value)}
              rows={3}
              placeholder='z. B. „War Schreiner und liebte die Natur. Lieblingszitat: Lebe, liebe, lache."'
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
              style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", lineHeight: 1.7 }}
            />
            {/* Religion */}
            <p className="text-xs mb-2" style={{ color: "#5a554e" }}>Religiöse Ausrichtung (beeinflusst Symbol auf der Innenseite)</p>
            <div className="flex flex-wrap gap-2">
              {["Weltlich", "Christlich", "Evangelisch", "Muslimisch", "Spirituell"].map(r => (
                <button key={r} onClick={() => setReligion(r)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: religion === r ? "rgba(201,169,110,0.12)" : "#201e1a",
                    border: `1px solid ${religion === r ? "#c9a96e" : "#302d28"}`,
                    color: religion === r ? "#c9a96e" : "#8a8278",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => { setGeneratedText(""); setMotifImageUrl(""); setStep(1); }}
              disabled={!selectedCaseId}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              <Sparkles className="w-4 h-4" /> Text & Motiv generieren
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Designs & Text ── */}
      {step === 1 && (
        <div className="space-y-6">

          {/* 4 Design-Kacheln */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                  {heroImageUrl ? "Außenseite — Portrait" : "Wählen Sie Ihr Design"}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>
                  {heroImageUrl
                    ? "Ihr hochgeladenes Foto wird als Außenseite verwendet."
                    : `4 personalisierte Designs für ${selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : "den Verstorbenen"}`}
                </p>
              </div>
              {!heroImageUrl && (
                <button onClick={generateFourDesigns} disabled={generatingDesigns}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all disabled:opacity-40"
                  style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                  {generatingDesigns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Alle neu generieren
                </button>
              )}
            </div>

            {heroImageUrl ? (
              /* Portrait-Vorschau wenn Foto vorhanden */
              <div className="flex items-start gap-5">
                <div style={{ width: 160, flexShrink: 0 }}>
                  <CardPrintPreview
                    caseData={selectedCase}
                    generatedText={editedText}
                    motifImageUrl=""
                    cardFormat={cardFormat}
                    side="front"
                    funeralHome={funeralHome}
                    heroImageUrl={heroImageUrl}
                    religion={religion}
                  />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs" style={{ color: "#4ade80" }}>✓ Portrait wird als Außenseite verwendet</p>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-2 rounded-lg w-fit"
                    style={{ background: "#302d28", color: "#c9a96e" }}>
                    <Camera className="w-3 h-3" /> Foto ändern
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                  </label>
                  <button onClick={() => setHeroImageUrl("")} className="text-xs px-3 py-2 rounded-lg w-fit text-left"
                    style={{ background: "#201e1a", color: "#5a554e" }}>
                    Entfernen → KI-Design nutzen
                  </button>
                </div>
              </div>
            ) : generatingDesigns ? (
              /* Skeleton während Generierung */
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: "2px solid #302d28" }}>
                    <div className="animate-pulse" style={{ aspectRatio: "148/210", background: "#181714", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#302d28" }} />
                    </div>
                    <div className="p-2.5" style={{ background: "#181714" }}>
                      <div className="h-3 rounded animate-pulse" style={{ background: "#302d28", width: "60%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : designs.length > 0 ? (
              /* Design-Grid */
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {designs.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDesignIdx(i)}
                    className="rounded-xl overflow-hidden transition-all text-left"
                    style={{ border: `2px solid ${selectedDesignIdx === i ? "#c9a96e" : "#302d28"}` }}>
                    <div style={{ aspectRatio: "148/210", position: "relative" }}>
                      <img src={d.motifUrl} alt={d.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.72) 100%)" }} />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F7F3ED", fontSize: 12, fontWeight: 500 }}>
                          {selectedCase ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name}` : ""}
                        </p>
                      </div>
                      {selectedDesignIdx === i && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#c9a96e" }}>
                          <Check className="w-3.5 h-3.5" style={{ color: "#0f0e0c" }} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5" style={{ background: "#181714" }}>
                      <p className="text-xs font-medium" style={{ color: selectedDesignIdx === i ? "#c9a96e" : "#f0ede8" }}>{d.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Text + Addons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Innenseiten-Vorschau */}
            <div>
              <div className="flex gap-2 mb-3">
                {["front", "inside"].map(side => (
                  <button key={side} onClick={() => setPreviewSide(side)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: previewSide === side ? "#c9a96e" : "#181714",
                      color: previewSide === side ? "#0f0e0c" : "#8a8278",
                      border: `1px solid ${previewSide === side ? "#c9a96e" : "#302d28"}`,
                    }}>
                    {side === "front" ? "Außenseite" : "Innenseite"}
                  </button>
                ))}
              </div>
              <CardPrintPreview
                caseData={selectedCase}
                generatedText={editedText}
                motifImageUrl={designs[selectedDesignIdx]?.motifUrl || ""}
                cardFormat={cardFormat}
                side={previewSide}
                funeralHome={funeralHome}
                heroImageUrl={heroImageUrl}
                religion={religion}
              />
            </div>

            {/* Text + Addons rechts */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                    Trauertext — Innenseite
                  </h3>
                  <button onClick={() => { setGeneratedText(""); generateText(); }}
                    disabled={generatingText}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
                    style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                    {generatingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Neu
                  </button>
                </div>
                {generatingText ? (
                  <div className="py-8 flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#c9a96e" }} />
                    <p className="text-xs" style={{ color: "#5a554e" }}>Text wird verfasst…</p>
                  </div>
                ) : (
                  <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={7}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.8 }} />
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#181714", border: "1px solid #302d28" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "#f0ede8" }}>Erweiterungen</p>
                {[
                  { val: addonInvitation, set: setAddonInvitation, icon: Mail, label: "Einladungskarte" },
                  { val: addonThankyou, set: setAddonThankyou, icon: BookOpen, label: "Danksagungskarte" },
                  { val: addonQr, set: setAddonQr, icon: QrCode, label: "QR-Code zur Gedenkseite" },
                ].map(({ val, set: setter, icon: AddonIcon, label }) => (
                  <button key={label} onClick={() => setter(!val)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mb-2 last:mb-0"
                    style={{ background: val ? "rgba(201,169,110,0.08)" : "#201e1a", border: `1px solid ${val ? "#c9a96e" : "#302d28"}` }}>
                    <AddonIcon className="w-4 h-4" style={{ color: val ? "#c9a96e" : "#5a554e" }} />
                    <span className="text-sm flex-1" style={{ color: "#f0ede8" }}>{label}</span>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: val ? "#c9a96e" : "#302d28" }}>
                      {val && <Check className="w-2.5 h-2.5" style={{ color: "#0f0e0c" }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>
              Zurück
            </button>
            <button
              onClick={async () => {
                const payload = {
                  case_id: selectedCaseId, format: cardFormat,
                  generated_text: editedText,
                  motif_image_url: heroImageUrl || designs[selectedDesignIdx]?.motifUrl || "",
                  questionnaire_answers: JSON.stringify({ extraInfo, religion, heroImageUrl, designs, selectedDesignIdx }),
                  addon_invitation: addonInvitation, addon_thankyou: addonThankyou, addon_qr: addonQr,
                  status: "entwurf",
                };
                if (draftCardId) {
                  await base44.entities.MourningCard.update(draftCardId, payload);
                } else {
                  const created = await base44.entities.MourningCard.create(payload);
                  setDraftCardId(created.id);
                }
                setDraftSaved(true); setTimeout(() => setDraftSaved(false), 2500);
              }}
              className="px-4 py-3 rounded-xl text-sm border flex-shrink-0"
              style={{ borderColor: draftSaved ? "#4ade80" : "#c9a96e", color: draftSaved ? "#4ade80" : "#c9a96e" }}>
              {draftSaved ? "✓ Gespeichert" : "Entwurf speichern"}
            </button>
            <button
              onClick={async () => {
                const name = selectedCase
                  ? `${selectedCase.deceased_first_name} ${selectedCase.deceased_last_name} – ${cardFormat}`
                  : `Vorlage ${new Date().toLocaleDateString("de")}`;
                await base44.entities.CardTemplate.create({
                  name,
                  format: cardFormat,
                  motif_image_url: heroImageUrl || designs[selectedDesignIdx]?.motifUrl || "",
                  text_template: editedText,
                  questionnaire_answers: JSON.stringify({ extraInfo, religion, heroImageUrl, designs, selectedDesignIdx }),
                  addon_invitation: addonInvitation,
                  addon_thankyou: addonThankyou,
                  addon_qr: addonQr,
                });
                setDraftSaved(true); setTimeout(() => setDraftSaved(false), 2500);
              }}
              className="px-4 py-3 rounded-xl text-sm border flex-shrink-0"
              style={{ borderColor: "#302d28", color: "#8a8278" }}>
              Als Vorlage
            </button>
            <button onClick={() => setStep(2)} disabled={!editedText}
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

          {/* Druckmodus-Auswahl */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPrintMode("order")}
              className="p-5 rounded-2xl text-left transition-all"
              style={{ background: printMode === "order" ? "rgba(201,169,110,0.08)" : "#181714", border: `2px solid ${printMode === "order" ? "#c9a96e" : "#302d28"}` }}>
              <p className="font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Print-on-Demand</p>
              <p className="text-xs" style={{ color: "#8a8278" }}>Wir drucken & liefern — professioneller Offsetdruck, fertig gefalzt</p>
            </button>
            <button onClick={() => setPrintMode("self")}
              className="p-5 rounded-2xl text-left transition-all"
              style={{ background: printMode === "self" ? "rgba(201,169,110,0.08)" : "#181714", border: `2px solid ${printMode === "self" ? "#c9a96e" : "#302d28"}` }}>
              <p className="font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Selbst drucken</p>
              <p className="text-xs" style={{ color: "#8a8278" }}>PDF-Export im Druckformat — für Ihren eigenen Drucker oder lokale Druckerei</p>
            </button>
          </div>

          {/* Print-on-Demand: Auflage + Tiers */}
          {printMode === "order" && (
            <>
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
            </>
          )}

          {/* Selbst drucken: PDF Export */}
          {printMode === "self" && (
            <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Druckdaten exportieren</h3>
              <p className="text-xs mb-5" style={{ color: "#8a8278" }}>
                Das PDF enthält beide Seiten (Außen & Innen) im exakten Format mit 3 mm Beschnitt und Schnittmarken — direkt druckfertig für Ihren Drucker oder eine lokale Druckerei.
              </p>
              <CardPdfExport
                caseData={selectedCase}
                generatedText={editedText}
                motifImageUrl={designs[selectedDesignIdx]?.motifUrl || ""}
                heroImageUrl={heroImageUrl}
                cardFormat={cardFormat}
                funeralHome={funeralHome}
                religion={religion}
              />
              <div className="mt-4 p-3 rounded-xl" style={{ background: "#201e1a", border: "1px solid #302d28" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "#c9a96e" }}>Druckempfehlungen</p>
                <ul className="text-xs space-y-1" style={{ color: "#8a8278" }}>
                  <li>• Papier: 300g/m² Kunstdruckpapier, beidseitig matt</li>
                  <li>• Auflösung: mindestens 300 dpi</li>
                  <li>• Farbprofil: CMYK (ISO Coated v2)</li>
                  <li>• Beschnitt: 3 mm an allen Seiten (bereits enthalten)</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Zurück</button>
            {printMode === "order" && (
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter zur Bestellung</button>
            )}
            {printMode === "self" && (
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: "#302d28", color: "#8a8278" }}>
                Trotzdem bestellen →
              </button>
            )}
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
              ["Format", FORMATS.find(f => f.id === cardFormat)?.label || "—"],
              ["Außenseite", heroImageUrl ? "Portrait (hochgeladen)" : (designs[selectedDesignIdx]?.label || "KI-Motiv")],
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