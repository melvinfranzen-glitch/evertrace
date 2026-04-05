import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Building2, FileText, User, Mail, Phone, MapPin, ChevronRight, Check } from "lucide-react";
import B2BPricingGrid from "@/components/pricing/B2BPricingGrid";
import { B2B_PLANS } from "@/components/pricing/pricingData";

const STEPS = ["Plan & Unternehmen", "Kontakt", "Bestätigung"];

export default function B2BRegister() {
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const getPlanName = (id) => B2B_PLANS.find(p => p.id === id)?.name || id;
  const [form, setForm] = useState({
    name: "", company_address: "", vat_number: "",
    contact_person: "", contact_email: "", contact_phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validateStep = () => {
   const e = {};
   if (step === 0) {
     if (!form.name.trim()) e.name = "Firmenname ist erforderlich.";
     if (!form.company_address.trim()) e.company_address = "Adresse ist erforderlich.";
   }
   if (step === 1) {
     if (!form.contact_person.trim()) e.contact_person = "Ansprechpartner ist erforderlich.";
     if (!form.contact_email.trim() || !form.contact_email.includes("@")) e.contact_email = "Gültige E-Mail-Adresse erforderlich.";
     if (!form.contact_phone.trim()) e.contact_phone = "Telefonnummer ist erforderlich.";
   }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };

  const submit = async () => {
   setLoading(true);
   await base44.entities.FuneralHome.create({ ...form, plan: selectedPlan, verified: false });
   setLoading(false);
   setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0f0e0c" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)" }}>
            <Check className="w-9 h-9" style={{ color: "#c9a96e" }} />
          </div>
          <h2 className="text-3xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
            Registrierung eingegangen
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>
            Vielen Dank. Wir haben Ihre Anfrage erhalten und werden Ihr Konto innerhalb von 24 Stunden freischalten. Sie erhalten eine Bestätigungs-E-Mail an <strong style={{ color: "#c9a96e" }}>{form.contact_email}</strong>.
          </p>
          <Link to="/B2BDashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all" style={{ background: "#c9a96e", color: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
            Zum Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: "#302d28" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#c9a96e" }}>
            <span style={{ color: "#0f0e0c", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14 }}>E</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8", fontSize: 20, fontWeight: 600 }}>Evertrace</span>
          <span style={{ color: "#5a554e", marginLeft: 8 }}>— Partner-Registrierung</span>
        </div>
        <Link to="/" className="text-sm flex items-center gap-1.5 transition-colors" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
          onMouseLeave={e => e.currentTarget.style.color = "#8a8278"}>
          ← Zur Startseite
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-14">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    background: i < step ? "#c9a96e" : i === step ? "rgba(201,169,110,0.2)" : "rgba(90,85,78,0.2)",
                    color: i <= step ? "#c9a96e" : "#5a554e",
                    border: `1px solid ${i <= step ? "#c9a96e" : "#302d28"}`
                  }}>
                  {i < step ? <Check className="w-3.5 h-3.5" style={{ color: "#0f0e0c" }} /> : i + 1}
                </div>
                {(i === step || i < step) && <span className="text-xs sm:text-sm hidden sm:block" style={{ color: i === step ? "#f0ede8" : "#5a554e" }}>{s}</span>}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4" style={{ color: "#302d28" }} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Plan & Company */}
        {step === 0 && (
          <div>
            <h1 className="text-4xl font-semibold text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
              Tarif wählen
            </h1>
            <p className="text-center mb-8" style={{ color: "#8a8278" }}>Starten Sie kostenlos oder wählen Sie direkt den vollen Funktionsumfang. Alle Preise zzgl. MwSt.</p>
            <B2BPricingGrid selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
            
            <div className="mt-12 max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Unternehmensdaten</h2>
            <p className="text-center mb-10" style={{ color: "#8a8278" }}>Angaben zu Ihrem Bestattungsunternehmen.</p>
            <div className="space-y-5">
              {[
                { k: "name", label: "Firmenname", icon: Building2, placeholder: "Bestattungshaus Müller GmbH" },
                { k: "company_address", label: "Adresse", icon: MapPin, placeholder: "Musterstraße 12, 80331 München" },
                { k: "vat_number", label: "Steuernummer / USt-IdNr.", icon: FileText, placeholder: "DE 123 456 789", optional: true },
              ].map(({ k, label, icon: Icon, placeholder, optional }) => (
                <div key={k}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-sm" style={{ color: "#8a8278" }}>{label}</label>
                    {optional && <span style={{ fontSize: 11, color: "#8a8278" }}>(optional)</span>}
                  </div>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5a554e" }} />
                    <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "#181714", border: `1px solid ${errors[k] ? "#e57373" : "#302d28"}`, color: "#f0ede8" }} />
                  </div>
                  {errors[k] && <p className="text-xs mt-1" style={{ color: "#e57373" }}>{errors[k]}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={next} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter</button>
            </div>
            </div>
          </div>
        )}

        {/* Step 1 — Contact */}
        {step === 1 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Kontaktdaten</h2>
            <p className="text-center mb-10" style={{ color: "#8a8278" }}>Angaben zum verantwortlichen Ansprechpartner.</p>
            <div className="space-y-5">
              {[
                { k: "contact_person", label: "Ansprechpartner", icon: User, placeholder: "Maria Müller" },
                { k: "contact_email", label: "E-Mail-Adresse", icon: Mail, placeholder: "m.mueller@bestattung.de" },
                { k: "contact_phone", label: "Telefonnummer", icon: Phone, placeholder: "+49 89 123456" },
              ].map(({ k, label, icon: Icon, placeholder }) => (
                <div key={k}>
                  <label className="block text-sm mb-1.5" style={{ color: "#8a8278" }}>{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5a554e" }} />
                    <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "#181714", border: `1px solid ${errors[k] ? "#e57373" : "#302d28"}`, color: "#f0ede8" }} />
                  </div>
                  {errors[k] && <p className="text-xs mt-1" style={{ color: "#e57373" }}>{errors[k]}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl text-sm font-medium border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Zurück</button>
              <button onClick={next} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Weiter</button>
            </div>
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Zusammenfassung</h2>
            <p className="text-center mb-10" style={{ color: "#8a8278" }}>Bitte überprüfen Sie Ihre Angaben.</p>
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "#181714", border: "1px solid #302d28" }}>
              {[
                ["Tarif", getPlanName(selectedPlan)],
                ["Firmenname", form.name],
                ["Adresse", form.company_address],
                ["Steuernummer", form.vat_number],
                ["Ansprechpartner", form.contact_person],
                ["E-Mail", form.contact_email],
                ["Telefon", form.contact_phone],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "#8a8278" }}>{label}</span>
                  <span style={{ color: "#f0ede8" }}>{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center mt-4" style={{ color: "#5a554e" }}>Mit der Registrierung stimmen Sie unseren AGB und der Datenschutzerklärung zu.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-medium border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Zurück</button>
              <button onClick={submit} disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
                Registrierung abschicken
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}