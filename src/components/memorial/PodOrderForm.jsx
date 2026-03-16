import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Package, Truck, BookOpen } from "lucide-react";

const FORMATS = [
  {
    id: "softcover_a5",
    label: "Softcover A5",
    desc: "Leicht & handlich, 60–80 Seiten",
    price: 34.90,
    icon: "📖",
  },
  {
    id: "hardcover_a4",
    label: "Hardcover A4",
    desc: "Hochwertig & repräsentativ, 80–120 Seiten",
    price: 59.90,
    icon: "📚",
  },
  {
    id: "premium_linen",
    label: "Leinen Premium A4",
    desc: "Edles Leinencover, Fadenheftung, Golddruck",
    price: 89.90,
    icon: "✨",
  },
];

export default function PodOrderForm({ memorial, condolenceCount, photoCount }) {
  const [format, setFormat] = useState("hardcover_a4");
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", street: "", city: "", zip: "", country: "Deutschland" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selectedFormat = FORMATS.find((f) => f.id === format);
  const total = (selectedFormat.price * qty).toFixed(2).replace(".", ",");

  const handleOrder = async () => {
    if (!form.name || !form.email || !form.street || !form.city || !form.zip) return;
    setSubmitting(true);
    await base44.entities.Order.create({
      memorial_id: memorial.id,
      product_type: "print_book",
      status: "pending",
      price: selectedFormat.price * qty,
      customer_name: form.name,
      customer_email: form.email,
      shipping_street: form.street,
      shipping_city: form.city,
      shipping_zip: form.zip,
      notes: `Format: ${selectedFormat.label} · Anzahl: ${qty} · Kondolenzen: ${condolenceCount} · Fotos: ${photoCount}`,
    });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5" style={{ background: "#f0fdf4" }}>
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Bestellung eingegangen
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
          Wir haben Ihre Bestellung erhalten und bereiten das Erinnerungsbuch für den Druck vor.
          Sie erhalten in Kürze eine Bestätigung an <strong>{form.email}</strong>.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Druck: 3–5 Werktage</div>
          <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Versand: 2–3 Werktage</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Book stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Seiten", value: `ca. ${Math.max(20, condolenceCount * 2 + photoCount + 10)}` },
          { icon: Package, label: "Kondolenzen", value: condolenceCount },
          { icon: Package, label: "Fotos", value: photoCount },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Format selection */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Buchformat wählen</Label>
        <div className="space-y-3">
          {FORMATS.map((f) => (
            <div
              key={f.id}
              onClick={() => setFormat(f.id)}
              className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
              style={{
                borderColor: format === f.id ? "#c9a96e" : "#e7e5e4",
                background: format === f.id ? "#fffcf5" : "white",
              }}
            >
              <span className="text-2xl">{f.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{f.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
              <p className="font-bold text-gray-800 text-sm whitespace-nowrap">€ {f.price.toFixed(2).replace(".", ",")}</p>
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: format === f.id ? "#c9a96e" : "#d1d5db" }}
              >
                {format === f.id && <div className="w-2 h-2 rounded-full" style={{ background: "#c9a96e" }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Anzahl Exemplare</Label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-lg font-semibold text-gray-600 hover:bg-stone-100 transition-colors"
          >−</button>
          <span className="text-xl font-semibold text-gray-800 w-8 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-lg font-semibold text-gray-600 hover:bg-stone-100 transition-colors"
          >+</button>
          <span className="text-sm text-gray-500 ml-2">× € {selectedFormat.price.toFixed(2).replace(".", ",")} = <strong className="text-gray-800">€ {total}</strong> inkl. MwSt.</span>
        </div>
      </div>

      {/* Shipping form */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">Lieferadresse</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Vollständiger Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maria Muster" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">E-Mail *</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="maria@beispiel.de" className="rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Straße & Hausnummer *</Label>
            <Input value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Musterstraße 12" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">PLZ *</Label>
              <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="80331" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Stadt *</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="München" className="rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Order summary + CTA */}
      <div className="rounded-xl border border-stone-200 p-5" style={{ background: "#fafaf8" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800">{selectedFormat.label} × {qty}</p>
            <p className="text-xs text-gray-500 mt-0.5">inkl. Versand nach Deutschland · 2–3 Werktage</p>
          </div>
          <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>€ {total}</p>
        </div>
        <Button
          className="w-full rounded-xl py-5 font-semibold text-base"
          style={{ background: "linear-gradient(135deg, #c9a96e, #a07830)", color: "#1c1917", boxShadow: "0 4px 20px rgba(201,169,110,0.35)" }}
          onClick={handleOrder}
          disabled={submitting || !form.name || !form.email || !form.street || !form.city || !form.zip}
        >
          {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Package className="w-5 h-5 mr-2" />}
          Erinnerungsbuch bestellen
        </Button>
        <p className="text-center text-xs text-gray-400 mt-3">Sichere Zahlung · DSGVO-konform · Druck in Deutschland</p>
      </div>
    </div>
  );
}