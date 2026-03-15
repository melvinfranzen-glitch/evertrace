import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ChevronLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

const PRODUCTS = [
  { id: "plaque_aluminium", label: "Aluminium-Plakette", desc: "Gebürstetes Aluminium, Lasergravur, wetterfest", price: 129, badge: null },
  { id: "plaque_slate", label: "Schiefer-Plakette", desc: "Naturschiefer, Lasergravur, zeitlos", price: 149, badge: null },
  { id: "plaque_steel", label: "Edelstahl Premium", desc: "Edelstahl gebürstet, Tiefengravur, UV-Schutz, inkl. Montageset", price: 219, badge: "Bestseller" },
];

function StepIndicator({ current }) {
  const steps = ["Gedenkseite", "Plakette", "Bestellung"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: i < current ? "#c9a96e" : i === current ? "rgba(201,169,110,0.15)" : "#f3f4f6", color: i <= current ? "#c9a96e" : "#9ca3af", border: `1px solid ${i <= current ? "#c9a96e" : "#e5e7eb"}` }}>
              {i < current ? <Check className="w-3 h-3" style={{ color: "#0f0e0c" }} /> : i + 1}
            </div>
            <span className="text-xs hidden sm:block" style={{ color: i === current ? "#c9a96e" : "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-6 h-px" style={{ background: i < current ? "#c9a96e" : "#e5e7eb" }} />}
        </div>
      ))}
    </div>
  );
}

function MemorialSelectorGrid({ memorials, selected, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>
        Für welche Gedenkseite möchten Sie eine Plakette bestellen?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {memorials.map(m => {
          const isSelected = selected?.short_id === m.short_id;
          return (
            <div key={m.id} onClick={() => onSelect(m)} className="cursor-pointer transition-all rounded-xl p-4"
              style={{ background: isSelected ? "rgba(201,169,110,0.04)" : "white", border: `1px solid ${isSelected ? "#c9a96e" : "#e5e7eb"}`, borderRadius: 12 }}>
              <div className="flex items-center gap-3">
                {m.hero_image_url
                  ? <img src={m.hero_image_url} alt={m.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold"
                      style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>
                      {m.name?.[0]}
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-semibold truncate" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#1c1917" }}>{m.name}</p>
                  {m.death_date && <p className="text-xs mt-0.5" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>† {m.death_date}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlaqueOrderTab({ memorials, initialMemorialId }) {
  const [step, setStep] = useState(0);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [engravingText, setEngravingText] = useState("");
  const [address, setAddress] = useState({ firstName: "", lastName: "", street: "", zip: "", city: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialMemorialId && memorials.length > 0) {
      const m = memorials.find(m => m.short_id === initialMemorialId);
      if (m) { setSelectedMemorial(m); setStep(1); }
    }
  }, [initialMemorialId, memorials]);

  const setAddr = (k, v) => setAddress(p => ({ ...p, [k]: v }));

  const memorialUrl = selectedMemorial
    ? `${window.location.origin}/MemorialProfile?id=${selectedMemorial.short_id}`
    : "";
  const qrSrc = memorialUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(memorialUrl)}`
    : "";

  const submitOrder = async () => {
    if (!address.firstName || !address.lastName || !address.street || !address.zip || !address.city || !address.email) return;
    setSaving(true);
    await base44.entities.Order.create({
      product_type: "memorial_plaque",
      memorial_id: selectedMemorial.id,
      plaque_type: selectedProduct.id,
      engraving_text: engravingText,
      qr_memorial_url: memorialUrl,
      customer_name: `${address.firstName} ${address.lastName}`,
      customer_email: address.email,
      shipping_street: address.street,
      shipping_city: address.city,
      shipping_zip: address.zip,
      notes: JSON.stringify(address),
      price: selectedProduct.price,
      status: "pending",
    });
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(201,169,110,0.15)", border: "1.5px solid #c9a96e" }}>
          <Check className="w-7 h-7" style={{ color: "#c9a96e" }} />
        </div>
        <h2 className="text-3xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Bestellung aufgenommen</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ihre Plakette wird innerhalb von 7–10 Werktagen mit dem personalisierten QR-Code gefertigt und an die angegebene Adresse versendet. Der QR-Code ist dauerhaft aktiv, solange die Gedenkseite besteht.
        </p>
        <button onClick={() => { setDone(false); setStep(0); setSelectedMemorial(null); setEngravingText(""); setAddress({ firstName: "", lastName: "", street: "", zip: "", city: "", email: "" }); }}
          className="px-6 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          Weitere Plakette bestellen
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Step 0 */}
      {step === 0 && (
        <MemorialSelectorGrid memorials={memorials} selected={selectedMemorial} onSelect={setSelectedMemorial} />
      )}
      {step === 0 && selectedMemorial && (
        <div className="flex justify-end">
          <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            Weiter →
          </button>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <StepIndicator current={1} />
          <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Plakette gestalten</h2>

          <div className="space-y-3 mb-6">
            {PRODUCTS.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer p-4 rounded-xl flex items-center gap-4 transition-all"
                style={{ border: `1.5px solid ${selectedProduct.id === p.id ? "#c9a96e" : "#e5e7eb"}`, background: selectedProduct.id === p.id ? "rgba(201,169,110,0.04)" : "white", borderRadius: 12 }}>
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${selectedProduct.id === p.id ? "#c9a96e" : "#d1d5db"}`, background: selectedProduct.id === p.id ? "#c9a96e" : "white" }}>
                  {selectedProduct.id === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                    {p.badge && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e" }}>{p.badge}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                </div>
                <p className="font-bold text-gray-800 flex-shrink-0">€ {p.price},–</p>
              </div>
            ))}
          </div>

          {/* QR preview */}
          <div className="rounded-xl p-5 flex gap-5 mb-6" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0" }}>
            <img src={qrSrc} alt="QR" className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm mb-1" style={{ color: "#5a554e", fontFamily: "'DM Sans', sans-serif" }}>Dieser QR-Code wird dauerhaft auf der Plakette graviert.</p>
              <p className="text-xs font-mono break-all mb-2" style={{ color: "#c9a96e" }}>{memorialUrl}</p>
              <p className="text-xs" style={{ color: "#8a8278" }}>Besucher scannen den Code direkt am Grab und gelangen sofort zur Gedenkseite.</p>
            </div>
          </div>

          {/* Engraving text */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Gravurtext (optional)</label>
            <div className="relative">
              <input value={engravingText} onChange={e => setEngravingText(e.target.value.slice(0, 40))}
                placeholder='Z.B. »In liebevoller Erinnerung«'
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-400 bg-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{engravingText.length}/40</span>
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
          <StepIndicator current={2} />
          <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Bestellung abschließen</h2>

          {/* Summary */}
          <div className="rounded-xl p-6 mb-6" style={{ background: "white", border: "1px solid #e8dfd0", borderRadius: 12 }}>
            <div className="flex items-center gap-3 mb-3">
              {selectedMemorial?.hero_image_url
                ? <img src={selectedMemorial.hero_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{selectedMemorial?.name?.[0]}</div>
              }
              <div>
                <p className="font-semibold text-gray-800 text-sm">{selectedMemorial?.name}</p>
                <p className="text-xs text-gray-500">{selectedProduct.label} · € {selectedProduct.price},–</p>
              </div>
            </div>
            {engravingText && <p className="text-xs text-gray-500 mb-2">Gravur: „{engravingText}"</p>}
            <p className="text-xs font-mono" style={{ color: "#c9a96e" }}>QR-Code → {memorialUrl}</p>
          </div>

          {/* Address form */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={address.firstName} onChange={e => setAddr("firstName", e.target.value)} placeholder="Vorname *"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
              <input value={address.lastName} onChange={e => setAddr("lastName", e.target.value)} placeholder="Nachname *"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            </div>
            <input value={address.street} onChange={e => setAddr("street", e.target.value)} placeholder="Straße & Hausnummer *"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={address.zip} onChange={e => setAddr("zip", e.target.value)} placeholder="PLZ *"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
              <input value={address.city} onChange={e => setAddr("city", e.target.value)} placeholder="Ort *"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            </div>
            <input type="email" value={address.email} onChange={e => setAddr("email", e.target.value)} placeholder="E-Mail für Versandbestätigung *"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
          </div>

          <div className="mb-2">
            <p className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#2c2419" }}>€ {selectedProduct.price},–</p>
            <p className="text-xs mt-0.5" style={{ color: "#8a8278" }}>inkl. Versand & Gravur · Lieferzeit 7–10 Werktage</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border sm:w-auto" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={submitOrder} disabled={saving} className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
              {saving ? "Wird bestellt…" : "Plakette jetzt bestellen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}