// ─── Shared Evertrace pricing constants ───────────────────────────────────────

// B2B Subscription Plans
export const B2B_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "€ 0",
    priceNum: 0,
    period: "/ Monat",
    vat: "zzgl. MwSt.",
    description: "Zum Kennenlernen der Plattform",
    cta: "Kostenlos starten",
    highlight: false,
    limits: { cases: 3, cards: 3, memorials: 1 },
    features: [
      { text: "3 aktive Fälle / Monat", included: true },
      { text: "3 Trauerkarten / Monat", included: true },
      { text: "1 Gedenkseite", included: true },
      { text: "Evertrace-Branding", included: true },
      { text: "White-Label (eigenes Logo)", included: false },
      { text: "Print-on-Demand", included: false },
      { text: "Analyse-Dashboard", included: false },
      { text: "QR-Code auf Karten", included: false },
      { text: "Jahrestags-Erinnerungen", included: false },
      { text: "Team-Verwaltung", included: false },
      { text: "API-Zugang", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "€ 39",
    priceNum: 39,
    period: "/ Monat",
    vat: "zzgl. MwSt.",
    description: "Für kleine Bestattungshäuser bis 180 Fälle/Jahr",
    cta: "Starter wählen",
    highlight: false,
    limits: { cases: 15, cards: 20, memorials: Infinity },
    features: [
      { text: "15 aktive Fälle / Monat", included: true },
      { text: "20 Trauerkarten / Monat", included: true },
      { text: "Unbegrenzte Gedenkseiten", included: true },
      { text: "Evertrace-Branding", included: true },
      { text: "White-Label (eigenes Logo)", included: true },
      { text: "Print-on-Demand", included: true },
      { text: "E-Mail-Support", included: true },
      { text: "Analyse-Dashboard", included: false },
      { text: "QR-Code auf Karten", included: false },
      { text: "Jahrestags-Erinnerungen", included: false },
      { text: "Team-Verwaltung", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "€ 99",
    priceNum: 99,
    period: "/ Monat",
    vat: "zzgl. MwSt.",
    description: "Für aktive Bestattungshäuser",
    cta: "Premium starten",
    highlight: true,
    badge: "Empfohlen",
    limits: { cases: 50, cards: 75, memorials: Infinity },
    features: [
      { text: "50 aktive Fälle / Monat", included: true },
      { text: "75 Trauerkarten / Monat", included: true },
      { text: "Unbegrenzte Gedenkseiten", included: true },
      { text: "White-Label (eigenes Logo)", included: true },
      { text: "Print-on-Demand", included: true },
      { text: "Vollständiges Analyse-Dashboard", included: true },
      { text: "QR-Code auf allen Karten", included: true },
      { text: "Jahrestags- & Geburtstags-Erinnerungen", included: true },
      { text: "Team-Verwaltung (bis 3 Nutzer)", included: true },
      { text: "Prioritäts-E-Mail-Support", included: true },
      { text: "API-Zugang", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Ab € 299",
    priceNum: 299,
    period: "/ Monat",
    vat: "Individuelle Konditionen auf Anfrage",
    description: "Für Bestattungsgruppen & Ketten",
    cta: "Kontakt aufnehmen",
    highlight: false,
    limits: { cases: Infinity, cards: Infinity, memorials: Infinity },
    features: [
      { text: "Unbegrenzte Fälle & Karten", included: true },
      { text: "Eigene Subdomain", included: true },
      { text: "Vollständige API", included: true },
      { text: "Unbegrenzte Team-Mitglieder", included: true },
      { text: "Rollen & Berechtigungen", included: true },
      { text: "Dedizierter Account Manager", included: true },
      { text: "SLA-Vereinbarung", included: true },
      { text: "Persönliches Onboarding vor Ort", included: true },
      { text: "Vollständiges Analyse-Dashboard", included: true },
      { text: "QR-Code auf allen Karten", included: true },
      { text: "Jahrestags-Erinnerungen", included: true },
    ],
  },
];

// B2B Print Tiers
export const PRINT_TIERS = [
  {
    id: "standard",
    label: "Standard",
    desc: "300g Mattkunstdruck, beidseitig",
    delivery: "3–4 Werktage",
    basePrice: 0.99,
    shipping: 6.90,
    minQty: 25,
  },
  {
    id: "premium",
    label: "Premium",
    desc: "350g mit Soft-Touch-Laminierung",
    delivery: "2–3 Werktage",
    basePrice: 1.49,
    shipping: 8.90,
    minQty: 25,
  },
  {
    id: "express",
    label: "Express",
    desc: "Premium Soft-Touch, garantierte Lieferung nächsten Werktag bis 10:00 Uhr",
    delivery: "Nächster Werktag bis 10:00 Uhr",
    basePrice: 2.29,
    shipping: 16.90,
    minQty: 25,
  },
];

export const DEFAULT_CARD_QUANTITY = 75;

export const ADDON_PRICES = {
  invitation_bundle: 0.59,
  invitation_standalone: 0.79,
  thankyou_bundle: 0.59,
  thankyou_standalone: 0.79,
};

// B2B Condolence Book
export const B2B_BOOK_TIERS = [
  { label: "1 Exemplar", unitPrice: 69 },
  { label: "2–4 Exemplare", unitPrice: 59 },
  { label: "5+ Exemplare", unitPrice: 49 },
];

export function getB2BBookUnitPrice(qty) {
  if (qty >= 5) return 49;
  if (qty >= 2) return 59;
  return 69;
}

// Memorial Plaques
export const PLAQUES = [
  { id: "plaque_aluminium", name: "Aluminium-Plakette", price: 129, desc: "Gebürstetes Aluminium, Lasergravur, wetterfest — 20 × 11 cm", badge: null },
  { id: "plaque_slate", name: "Schiefer-Plakette", price: 149, desc: "Naturschiefer, Lasergravur, zeitlos — 20 × 11 cm", badge: null },
  { id: "plaque_steel", name: "Edelstahl-Plakette Premium", price: 219, desc: "Edelstahl gebürstet, Tiefengravur, UV-Schutz, Montageset — 20 × 11 cm", badge: "Bestseller" },
];

// B2C
export const B2C_BOOK_TIERS = [
  { label: "1 Exemplar", unitPrice: 59 },
  { label: "2–4 Exemplare", unitPrice: 49 },
  { label: "5+ Exemplare", unitPrice: 39 },
];

export function getB2CBookUnitPrice(qty) {
  if (qty >= 5) return 39;
  if (qty >= 2) return 49;
  return 59;
}

export function fmtEur(num) {
  return num.toFixed(2).replace(".", ",");
}

export function getPlanLimits(planId) {
  return B2B_PLANS.find(p => p.id === planId)?.limits || B2B_PLANS[0].limits;
}