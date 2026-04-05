import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Package, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import PlaqueConfigurator from "@/components/shop/PlaqueConfigurator";
import { PLAQUES } from "@/components/pricing/pricingData";

const BOOK_PRODUCT = { id: "print_book", icon: BookOpen, label: "Kondolenzbuch (Hardcover)", desc: "Alle Beiträge der Gedenkseite, professionell gestaltet, Soft-Touch-Einband — A4", price: 59 };
const PRODUCTS = [...PLAQUES.map(p => ({ ...p, icon: Package, label: p.name })), BOOK_PRODUCT];
const PRICES = Object.fromEntries([...PLAQUES.map(p => [p.id, p.price]), ["print_book", 59]]);

export default function Shop() {
  const navigate = useNavigate();
  const [memorials, setMemorials] = useState([]);
  const [user, setUser] = useState(null);
  const [productType, setProductType] = useState(PLAQUES[0].id);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [b2bSlug, setB2bSlug] = useState(null);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", shipping_street: "", shipping_city: "", shipping_zip: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const urlMemorialId = urlParams.get("memorial_id");
  const urlCaseId = urlParams.get("case_id");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm((p) => ({ ...p, customer_name: u.full_name || "", customer_email: u.email || "" }));
      base44.entities.Memorial.filter({ created_by: u.email }).then(async (ms) => {
        setMemorials(ms);
        if (urlMemorialId) {
          const match = ms.find(m => m.short_id === urlMemorialId);
          if (match) { setSelectedMemorial(match); return; }
          // fallback: query by short_id
          const found = await base44.entities.Memorial.filter({ short_id: urlMemorialId });
          if (found[0]) setSelectedMemorial(found[0]);
          else if (ms.length > 0) setSelectedMemorial(ms[0]);
        } else if (urlCaseId) {
          const b2bPages = await base44.entities.B2BMemorialPage.filter({ case_id: urlCaseId });
          if (b2bPages[0]) setB2bSlug(b2bPages[0].slug);
          if (ms.length > 0) setSelectedMemorial(ms[0]);
        } else if (ms.length > 0) {
          setSelectedMemorial(ms[0]);
        }
      });
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleOrder = async () => {
    if (!form.customer_name || !form.customer_email || !form.shipping_street || !form.shipping_city || !form.shipping_zip) return;
    setSaving(true);
    await base44.entities.Order.create({
      ...form,
      memorial_id: selectedMemorial?.id || "",
      product_type: productType,
      price: PRICES[productType],
      status: "pending",
    });
    setSaving(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4" style={{ background: "#FAFAF8" }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6" style={{ background: "#ecfdf5" }}>
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Bestellung aufgenommen!</h2>
          <p className="text-gray-500 mb-6">Wir fertigen Ihre Plakette innerhalb von 5–7 Werktagen mit dem personalisierten QR-Code und versenden sie an die angegebene Adresse. Der QR-Code ist dauerhaft aktiv solange die Gedenkseite besteht.</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="text-white rounded-xl px-8" style={{ background: "#c9a96e" }}>
            Zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Grabplaketten mit QR-Code</p>
          <h1 className="text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Grabplaketten mit QR-Code
          </h1>
          <p className="text-gray-500 font-light max-w-lg mx-auto">
            Hochwertig gravierte Plaketten für Grabstein, Urne oder Gedenkstein — mit persönlichem QR-Code, der direkt auf die digitale Gedenkseite führt. Besucher scannen und erleben die Geschichte des Menschen.
          </p>
        </div>

        {/* QR destination preview */}
        {(selectedMemorial || b2bSlug) && (
          <div className="mb-6 px-4 py-3 rounded-xl border" style={{ background: "#f7f3ed", borderColor: "#e8dfd0" }}>
            <p className="text-xs font-medium text-gray-500 mb-1">QR-Code zeigt auf:</p>
            <p className="text-sm font-mono break-all" style={{ color: "#c9a96e" }}>
              {b2bSlug
                ? `evertrace.de/B2BPublicMemorial?slug=${b2bSlug}`
                : `evertrace.de/MemorialProfile?id=${selectedMemorial?.short_id}`}
            </p>
          </div>
        )}

        {/* Product selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              onClick={() => setProductType(p.id)}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all"
              style={{ borderColor: productType === p.id ? "#c9a96e" : "#e5e7eb", background: productType === p.id ? "#fffbf5" : "white" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: productType === p.id ? "rgba(201,169,110,0.1)" : "#f5f5f4" }}>
                <p.icon className="w-6 h-6" style={{ color: productType === p.id ? "#c9a96e" : "#9ca3af" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{p.label}</p>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
              <p className="font-bold text-gray-800 flex-shrink-0">€ {p.price}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurator */}
          {productType !== "print_book" && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Vorschau & Konfiguration</h3>
              {memorials.length > 0 && (
                <div className="mb-5">
                  <Label>Gedenkseite wählen</Label>
                  <select
                    className="w-full mt-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                    value={selectedMemorial?.id || ""}
                    onChange={(e) => setSelectedMemorial(memorials.find((m) => m.id === e.target.value) || null)}
                  >
                    {memorials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
              <PlaqueConfigurator memorial={selectedMemorial} selected={productType} onSelect={setProductType} />
            </div>
          )}

          {/* Order form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Lieferadresse</h3>
            <div className="space-y-4">
              <div><Label>Vollständiger Name *</Label><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="mt-1 rounded-xl" /></div>
              <div><Label>E-Mail *</Label><Input type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} className="mt-1 rounded-xl" /></div>
              <div><Label>Straße & Hausnummer *</Label><Input value={form.shipping_street} onChange={(e) => set("shipping_street", e.target.value)} className="mt-1 rounded-xl" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1"><Label>PLZ *</Label><Input value={form.shipping_zip} onChange={(e) => set("shipping_zip", e.target.value)} className="mt-1 rounded-xl" /></div>
                <div className="col-span-2"><Label>Stadt *</Label><Input value={form.shipping_city} onChange={(e) => set("shipping_city", e.target.value)} className="mt-1 rounded-xl" /></div>
              </div>
              <div><Label>Hinweise (optional)</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1 rounded-xl h-16 resize-none" /></div>

              <div className="border-t border-stone-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Produkt</span><span>€ {PRICES[productType]}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Versand</span><span>inkl.</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Gesamt</span><span>€ {PRICES[productType]}</span>
                </div>
              </div>

              <Button
                onClick={handleOrder}
                disabled={saving || !form.customer_name || !form.customer_email || !form.shipping_street || !form.shipping_city || !form.shipping_zip}
                className="w-full rounded-xl text-white py-5"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
                Jetzt bestellen
              </Button>
              <p className="text-xs text-gray-400 text-center">Zahlung per Rechnung · Lieferung 5–7 Werktage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}