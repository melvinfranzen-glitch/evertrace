import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Plus, Globe, Eye, Lock, Link2, Sparkles, Loader2, X, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const PRIVACY_CONFIG = {
  public: { label: "Öffentlich", icon: Globe, color: "#4ade80" },
  link: { label: "Nur mit Link", icon: Link2, color: "#c9a96e" },
  private: { label: "Privat", icon: Lock, color: "#8a8278" },
};

function slugify(str) {
  return str.toLowerCase().replace(/[äöü]/g, c => ({ ä: "ae", ö: "oe", ü: "ue" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function B2BMemorial() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [newPageCaseId, setNewPageCaseId] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const preselectedCaseId = params.get("case_id");

  const EMPTY = { case_id: preselectedCaseId || "", biography: "", funeral_date: "", funeral_location: "", privacy: "public", main_photo_url: "", linked_memorial_short_id: "" };
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(fh => {
        if (fh.length === 0) { navigate("/B2BRegister"); return; }
        Promise.all([
          base44.entities.B2BMemorialPage.filter({ created_by: u.email }, "-created_date", 50),
          base44.entities.Case.filter({ created_by: u.email }, "-created_date", 100),
        ]).then(([p, c]) => { setPages(p); setCases(c); setLoading(false); });
      });
    });
    if (preselectedCaseId) setShowModal(true);
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getCase = (id) => cases.find(c => c.id === id);

  const generateBio = async () => {
    const c = getCase(form.case_id);
    if (!c) return;
    setGeneratingBio(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Schreibe eine würdevolle, kurze Biografie (3–4 Sätze) auf Deutsch für ${c.deceased_first_name} ${c.deceased_last_name}, geboren ${fmtDate(c.date_of_birth)}, gestorben ${fmtDate(c.date_of_death)}. Bestattungsart: ${c.burial_type}. Der Text soll warm und persönlich sein und die Trauernden ansprechen.`,
    });
    set("biography", result);
    setGeneratingBio(false);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("main_photo_url", file_url);
    setUploading(false);
  };

  const save = async () => {
    if (!form.case_id) return;
    setSaving(true);
    const c = getCase(form.case_id);
    const slug = c ? `${slugify(c.deceased_first_name)}-${slugify(c.deceased_last_name)}-${Date.now().toString(36)}` : `gedenkseite-${Date.now().toString(36)}`;
    const page = await base44.entities.B2BMemorialPage.create({ ...form, slug });
    await base44.entities.Case.update(form.case_id, { has_memorial: true });
    setPages(p => [page, ...p]);
    setShowModal(false);
    setForm(EMPTY);
    setSaving(false);
    setNewPageCaseId(form.case_id);
  };

  return (
    <B2BLayout
      title="Gedenkseiten"
      subtitle="Digitale Erinnerungsräume für Angehörige"
      action={
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          <Plus className="w-4 h-4" /> Neue Gedenkseite
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl py-24 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: "#302d28" }} />
          <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Noch keine Gedenkseiten</p>
          <p className="text-sm mb-6" style={{ color: "#5a554e" }}>Erstellen Sie digitale Erinnerungsräume für die Angehörigen.</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            <Plus className="w-4 h-4" /> Erste Gedenkseite
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {newPageCaseId && (
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#181714", border: "1px solid rgba(201,169,110,0.4)" }}>
              <p className="text-sm font-semibold" style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>Plakette für das Grab bestellen?</p>
              <p className="text-xs" style={{ color: "#8a8278" }}>Bieten Sie den Angehörigen eine gravierte QR-Plakette für den Grabstein an.</p>
              <div className="flex items-center gap-2">
                <a href={`/Shop?case_id=${newPageCaseId}`}
                  className="flex-1 text-center py-2 rounded-xl text-xs font-medium"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  Zum Shop →
                </a>
                <button onClick={() => setNewPageCaseId(null)} className="px-3 py-2 rounded-xl text-xs" style={{ color: "#5a554e", border: "1px solid #302d28" }}>
                  Schließen
                </button>
              </div>
            </div>
          )}
          {pages.map(page => {
            const c = getCase(page.case_id);
            const priv = PRIVACY_CONFIG[page.privacy] || PRIVACY_CONFIG.public;
            const PrivIcon = priv.icon;
            return (
              <div key={page.id} className="rounded-2xl overflow-hidden" style={{ background: "#181714", border: "1px solid #302d28" }}>
                {page.main_photo_url ? (
                  <div className="h-32 overflow-hidden">
                    <img src={page.main_photo_url} alt="" className="w-full h-full object-cover object-face" />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1c19,#141210)" }}>
                    <Globe className="w-8 h-8" style={{ color: "#302d28" }} />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                    {c ? `${c.deceased_first_name} ${c.deceased_last_name}` : "Unbekannte Person"}
                  </h3>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: "#5a554e" }}>
                    {page.funeral_date ? fmtDate(page.funeral_date) : "Datum unbekannt"}
                    {page.funeral_location ? ` · ${page.funeral_location}` : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#5a554e" }}>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {page.visit_count || 0}</span>
                      <span>{page.contribution_count || 0} Beiträge</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: priv.color }}>
                        <PrivIcon className="w-3 h-3" /> {priv.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={`/B2BPublicMemorial?slug=${page.slug}&edit=true`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
                      style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                      Bearbeiten
                    </a>
                    <a href={`/B2BPublicMemorial?slug=${page.slug}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
                      style={{ background: "#201e1a", color: "#c9a96e", border: "1px solid #302d28" }}>
                      <ExternalLink className="w-3 h-3" /> Ansicht
                    </a>
                    {(page.linked_memorial_short_id || c?.short_id) ? (
                      <a href={`/MemorialProfile?id=${page.linked_memorial_short_id || c?.short_id}`} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
                        style={{ background: "rgba(201,169,110,0.08)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}>
                        <ExternalLink className="w-3 h-3" /> Gedenkseite
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5" style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Neue Gedenkseite</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Fall auswählen</label>
                <select value={form.case_id} onChange={e => set("case_id", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
                  <option value="">— Bitte wählen —</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.deceased_first_name} {c.deceased_last_name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs" style={{ color: "#8a8278" }}>Biografie</label>
                  <button onClick={generateBio} disabled={!form.case_id || generatingBio} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all disabled:opacity-40"
                    style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e" }}>
                    {generatingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Textentwurf
                  </button>
                </div>
                <textarea value={form.biography} onChange={e => set("biography", e.target.value)} rows={4}
                  placeholder="Biografie oder kurze Beschreibung…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Datum der Trauerfeier</label>
                  <input type="date" value={form.funeral_date} onChange={e => set("funeral_date", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Ort der Trauerfeier</label>
                  <input value={form.funeral_location} onChange={e => set("funeral_location", e.target.value)} placeholder="z.B. Friedhof Mühlstraße"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>
                  Verknüpfte B2C-Gedenkseite (optional)
                </label>
                <input
                  value={form.linked_memorial_short_id}
                  onChange={e => set("linked_memorial_short_id", e.target.value.trim())}
                  placeholder="Kurz-ID der Gedenkseite, z.B. abc123"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}
                />
                <p className="text-xs mt-1" style={{ color: "#5a554e" }}>
                  Die Kurz-ID findet sich in der URL: /MemorialProfile?id=<span style={{ color: "#c9a96e" }}>KURZ-ID</span>
                </p>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Datenschutz</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PRIVACY_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => set("privacy", key)}
                        className="p-2.5 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-all"
                        style={{ background: form.privacy === key ? `${cfg.color}15` : "#201e1a", border: `1px solid ${form.privacy === key ? cfg.color : "#302d28"}`, color: form.privacy === key ? cfg.color : "#8a8278" }}>
                        <Icon className="w-4 h-4" /> {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Foto (optional)</label>
                {form.main_photo_url ? (
                  <div className="relative">
                    <img src={form.main_photo_url} alt="" className="w-full h-32 object-cover object-face rounded-xl" />
                    <button onClick={() => set("main_photo_url", "")} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 rounded-xl cursor-pointer border-2 border-dashed transition-all" style={{ borderColor: "#302d28", color: "#5a554e" }}>
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mb-1" /><span className="text-xs">Foto hochladen</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Abbrechen</button>
              <button onClick={save} disabled={saving || !form.case_id} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}