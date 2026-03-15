import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ChevronLeft, Minus, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";

const TIERS = [
  { label: "1 Exemplar", unitPrice: 59, min: 1, max: 1 },
  { label: "2–4 Exemplare", unitPrice: 49, min: 2, max: 4 },
  { label: "5+ Exemplare", unitPrice: 39, min: 5, max: 999 },
];

function getUnitPrice(qty) {
  if (qty >= 5) return 39;
  if (qty >= 2) return 49;
  return 59;
}

function MemorialSelectorGrid({ memorials, selected, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>
        Für welche Gedenkseite möchten Sie ein Buch erstellen?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memorials.map(m => {
          const isSelected = selected?.id === m.id;
          const hasBio = !!(m.biography && m.biography.trim());
          const hasPhotos = !!(m.gallery_images && m.gallery_images.length > 0);
          const ready = hasBio && hasPhotos;
          return (
            <div key={m.id} onClick={() => onSelect(m)} className="cursor-pointer transition-all rounded-xl p-4"
              style={{ background: isSelected ? "rgba(201,169,110,0.04)" : "white", border: `1px solid ${isSelected ? "#c9a96e" : "#e5e7eb"}`, borderRadius: 12 }}>
              <div className="flex items-center gap-3 mb-3">
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
              {isSelected && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${hasBio ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {hasBio ? "✓ Biografie" : "Biografie fehlt"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${hasPhotos ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {hasPhotos ? "✓ Fotos" : "Noch keine Fotos hochgeladen"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LifeBookTab({ memorials }) {
  const [step, setStep] = useState(0);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState({ firstName: "", lastName: "", street: "", zip: "", city: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const setAddr = (k, v) => setAddress(p => ({ ...p, [k]: v }));
  const unitPrice = getUnitPrice(qty);
  const total = qty * unitPrice;

  const ready = selectedMemorial
    ? !!(selectedMemorial.biography?.trim()) && !!(selectedMemorial.gallery_images?.length > 0)
    : false;

  const submitOrder = async () => {
    if (!address.firstName || !address.lastName || !address.street || !address.zip || !address.city || !address.email) return;
    setSaving(true);
    await base44.entities.Order.create({
      product_type: "life_book",
      memorial_id: selectedMemorial.id,
      quantity: qty,
      notes: JSON.stringify({ ...address, unit_price: unitPrice, qty }),
      customer_name: `${address.firstName} ${address.lastName}`,
      customer_email: address.email,
      shipping_street: address.street,
      shipping_city: address.city,
      shipping_zip: address.zip,
      price: total,
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
          Wir generieren Ihr Lebensgeschichten-Buch aus den Inhalten der Gedenkseite und lassen es in Deutschland drucken. Lieferzeit: 7–10 Werktage.
        </p>
        <button onClick={() => { setDone(false); setStep(0); setSelectedMemorial(null); setQty(1); setAddress({ firstName: "", lastName: "", street: "", zip: "", city: "", email: "" }); }}
          className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          Weiteres Buch bestellen
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Step 0 */}
      {step === 0 && (
        <div>
          <MemorialSelectorGrid memorials={memorials} selected={selectedMemorial} onSelect={setSelectedMemorial} />
          {selectedMemorial && (
            <div className="flex justify-end mt-6">
              {ready ? (
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  Buch erstellen →
                </button>
              ) : (
                <button onClick={() => window.location.href = createPageUrl("EditMemorial") + `?id=${selectedMemorial.id}`}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
                  Gedenkseite vervollständigen →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {["Gedenkseite", "Buch bestellen"].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: i < 1 ? "#c9a96e" : i === 1 ? "rgba(201,169,110,0.15)" : "#f3f4f6", color: i <= 1 ? "#c9a96e" : "#9ca3af", border: `1px solid ${i <= 1 ? "#c9a96e" : "#e5e7eb"}` }}>
                    {i < 1 ? <Check className="w-3 h-3" style={{ color: "#0f0e0c" }} /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: i === 1 ? "#c9a96e" : "#9ca3af" }}>{s}</span>
                </div>
                {i < 1 && <div className="w-6 h-px" style={{ background: "#c9a96e" }} />}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ihr persönliches Lebensgeschichten-Buch</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Book mockup */}
            <div>
              <div className="p-8" style={{ background: "linear-gradient(160deg, #f7f3ed, #ede8df)", border: "1px solid #d4c9b0", borderRadius: 8, boxShadow: "-4px 4px 0 #c9a96e, -8px 8px 0 rgba(201,169,110,0.3)" }}>
                <div className="flex flex-col items-center text-center">
                  {selectedMemorial?.hero_image_url
                    ? <img src={selectedMemorial.hero_image_url} alt="" className="w-16 h-16 rounded-full object-cover mb-3" />
                    : <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-xl font-semibold" style={{ background: "rgba(201,169,110,0.2)", color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{selectedMemorial?.name?.[0]}</div>
                  }
                  <p className="font-semibold italic mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#2c2419" }}>{selectedMemorial?.name}</p>
                  <p className="text-xs mb-4" style={{ color: "#8a8278" }}>
                    {selectedMemorial?.birth_date?.slice(0,4)}{selectedMemorial?.birth_date && selectedMemorial?.death_date ? " – " : ""}{selectedMemorial?.death_date?.slice(0,4)}
                  </p>
                  {[...Array(3)].map((_, i) => <div key={i} className="w-full h-2 rounded-full mb-1.5" style={{ background: "#c0b9ae", width: `${80 - i * 10}%` }} />)}
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {["KI-aufbereitete Lebensgeschichte aus Ihren Einträgen", "Alle Fotos in würdevollem Layout", "Hardcover Soft-Touch, A4, dauerhaft haltbar"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#c9a96e" }}>•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Order config */}
            <div>
              <div className="space-y-2 mb-5">
                {TIERS.map(t => {
                  const active = qty >= t.min && qty <= t.max;
                  return (
                    <div key={t.label} className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                      style={{ border: `1.5px solid ${active ? "#c9a96e" : "#e5e7eb"}`, background: active ? "rgba(201,169,110,0.04)" : "white" }}>
                      <span className="text-sm" style={{ color: active ? "#c9a96e" : "#6b7280" }}>{t.label}</span>
                      <span className="text-sm font-semibold" style={{ color: active ? "#c9a96e" : "#6b7280" }}>€ {t.unitPrice} / Stk.</span>
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

              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#2c2419", fontWeight: 600 }}>€ {total},–</p>
              <p className="text-xs mt-0.5 mb-5" style={{ color: "#8a8278" }}>inkl. Versand · Lieferzeit 7–10 Werktage · Gedruckt in Deutschland</p>
            </div>
          </div>

          {/* Address form */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={address.firstName} onChange={e => setAddr("firstName", e.target.value)} placeholder="Vorname *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
              <input value={address.lastName} onChange={e => setAddr("lastName", e.target.value)} placeholder="Nachname *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            </div>
            <input value={address.street} onChange={e => setAddr("street", e.target.value)} placeholder="Straße & Hausnummer *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={address.zip} onChange={e => setAddr("zip", e.target.value)} placeholder="PLZ *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
              <input value={address.city} onChange={e => setAddr("city", e.target.value)} placeholder="Ort *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
            </div>
            <input type="email" value={address.email} onChange={e => setAddr("email", e.target.value)} placeholder="E-Mail für Versandbestätigung *" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", borderRadius: 8, color: "#2c2419" }} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setStep(0)} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm border sm:w-auto" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={submitOrder} disabled={saving} className="flex-1 flex items-center justify-center disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c", borderRadius: 10, height: 52, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>
              {saving ? "Wird bestellt…" : "Lebensgeschichten-Buch bestellen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}