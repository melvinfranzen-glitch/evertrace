import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, Plus, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const BURIAL_TYPES = ["Erdbestattung", "Feuerbestattung", "Seebestattung", "Waldbestattung", "Urnenbeisetzung"];

export default function OnboardingFlow({ funeralHome, onComplete }) {
  const [step, setStep] = useState(0);
  const [logoUrl, setLogoUrl] = useState(funeralHome?.logo_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCase, setNewCase] = useState(null);
  const [caseForm, setCaseForm] = useState({
    deceased_first_name: "", deceased_last_name: "",
    date_of_death: "", burial_type: "Erdbestattung",
  });

  const uploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    setUploading(false);
  };

  const saveLogo = async () => {
    setSaving(true);
    await base44.entities.FuneralHome.update(funeralHome.id, { logo_url: logoUrl });
    setSaving(false);
    setStep(1);
  };

  const saveCase = async () => {
    if (!caseForm.deceased_first_name || !caseForm.deceased_last_name) return;
    setSaving(true);
    const created = await base44.entities.Case.create({ ...caseForm, status: "aktiv" });
    setNewCase(created);
    setSaving(false);
    setStep(2);
  };

  const finish = async () => {
    await base44.entities.FuneralHome.update(funeralHome.id, { onboarding_completed: true });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {["Logo", "Erster Fall", "Fertig"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: i < step ? "#c9a96e" : i === step ? "rgba(201,169,110,0.2)" : "rgba(90,85,78,0.2)",
                    color: i <= step ? "#c9a96e" : "#5a554e",
                    border: `1px solid ${i <= step ? "#c9a96e" : "#302d28"}`
                  }}>
                  {i < step ? <Check className="w-3.5 h-3.5" style={{ color: "#0f0e0c" }} /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? "#f0ede8" : "#5a554e" }}>{s}</span>
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: "#302d28" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#181714", border: "1px solid #302d28" }}>

          {/* Step 0 — Logo */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                Willkommen bei Evertrace
              </h2>
              <p className="text-sm mb-8" style={{ color: "#8a8278" }}>
                Laden Sie zuerst Ihr Logo hoch — es erscheint auf allen Gedenkseiten, die Sie erstellen.
              </p>

              {logoUrl ? (
                <div className="mb-6 flex flex-col items-center gap-4">
                  <img src={logoUrl} alt="Logo" className="h-20 object-contain rounded-xl" />
                  <button className="text-xs" style={{ color: "#c9a96e" }} onClick={() => setLogoUrl("")}>Anderes Bild wählen</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 rounded-2xl cursor-pointer border-2 border-dashed mb-6 transition-all"
                  style={{ borderColor: "#302d28", color: "#5a554e" }}>
                  {uploading
                    ? <Loader2 className="w-6 h-6 animate-spin mb-2" style={{ color: "#c9a96e" }} />
                    : <Upload className="w-6 h-6 mb-2" />}
                  <span className="text-sm">{uploading ? "Wird hochgeladen…" : "Logo hochladen"}</span>
                  <span className="text-xs mt-1">PNG, JPG oder SVG</span>
                  <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={uploading} />
                </label>
              )}

              <div className="flex gap-3">
                <button onClick={finish} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#5a554e" }}>
                  Überspringen
                </button>
                <button onClick={saveLogo} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Weiter <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — First case */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                Ihren ersten Fall anlegen
              </h2>
              <p className="text-sm mb-8" style={{ color: "#8a8278" }}>
                Legen Sie gleich den ersten Fall an — damit können Sie sofort eine Trauerkarte und Gedenkseite erstellen.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "deceased_first_name", label: "Vorname" },
                    { k: "deceased_last_name", label: "Nachname" },
                  ].map(({ k, label }) => (
                    <div key={k}>
                      <label className="text-xs mb-1 block" style={{ color: "#8a8278" }}>{label}</label>
                      <input value={caseForm[k]} onChange={e => setCaseForm(p => ({ ...p, [k]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#8a8278" }}>Sterbedatum</label>
                  <input type="date" value={caseForm.date_of_death} onChange={e => setCaseForm(p => ({ ...p, date_of_death: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#8a8278" }}>Bestattungsart</label>
                  <select value={caseForm.burial_type} onChange={e => setCaseForm(p => ({ ...p, burial_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
                    {BURIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={finish} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#5a554e" }}>
                  Überspringen
                </button>
                <button onClick={saveCase} disabled={saving || !caseForm.deceased_first_name || !caseForm.deceased_last_name}
                  className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Fall anlegen
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Done */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                <Check className="w-7 h-7" style={{ color: "#4ade80" }} />
              </div>
              <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                Alles bereit!
              </h2>
              <p className="text-sm mb-8" style={{ color: "#8a8278" }}>
                {newCase
                  ? `Der Fall "${newCase.deceased_first_name} ${newCase.deceased_last_name}" ist angelegt. Was möchten Sie als Nächstes tun?`
                  : "Ihr Konto ist eingerichtet. Was möchten Sie als Nächstes tun?"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {newCase && (
                  <>
                    <Link to={`/B2BCardWizard?case_id=${newCase.id}`} onClick={finish}
                      className="p-4 rounded-2xl text-left transition-all"
                      style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e" }}>
                      <div className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Trauerkarte erstellen</div>
                      <p className="text-xs" style={{ color: "#8a8278" }}>Persönlicher Assistent</p>
                    </Link>
                    <Link to={`/B2BMemorial?case_id=${newCase.id}`} onClick={finish}
                      className="p-4 rounded-2xl text-left transition-all"
                      style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                      <div className="text-lg font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gedenkseite erstellen</div>
                      <p className="text-xs" style={{ color: "#8a8278" }}>Digitale Erinnerungsseite</p>
                    </Link>
                  </>
                )}
              </div>

              <button onClick={finish} className="text-sm" style={{ color: "#5a554e" }}>
                Zum Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}