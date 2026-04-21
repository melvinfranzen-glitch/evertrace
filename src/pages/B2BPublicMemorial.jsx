import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, Feather, Upload, Flame, Copy, Check, BookOpen, Pencil, X, Save, Globe, Link2, Lock, ExternalLink } from "lucide-react";
import QrSharePanel from "@/components/memorial/QrSharePanel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import CondolenceBookPrintModal from "@/components/b2b/CondolenceBookPrintModal";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd. MMMM yyyy", { locale: de }); }
  catch { return d; }
}

export default function B2BPublicMemorial() {
  const [page, setPage] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [funeralHome, setFuneralHome] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contributor_name: "", message: "", is_candle: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [user, setUser] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const slug = urlSearchParams.get("slug");
  const editMode = urlSearchParams.get("edit") === "true";

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    base44.entities.B2BMemorialPage.filter({ slug }).then(async ([p]) => {
      if (!p) { setLoading(false); return; }
      setPage(p);
      const [contributions, cases, fhList] = await Promise.all([
        base44.entities.B2BContribution.filter({ memorial_page_id: p.id }, "-created_date"),
        p.case_id ? base44.entities.Case.filter({ id: p.case_id }) : Promise.resolve([]),
        p.funeral_home_id ? base44.entities.FuneralHome.filter({ id: p.funeral_home_id }) : Promise.resolve([]),
      ]);
      setContributions(contributions);
      const resolvedCase = cases[0] || null;
      if (resolvedCase) setCaseData(resolvedCase);
      // Resolve funeral home: direct id first, fallback to case.created_by
      if (fhList[0]) {
        setFuneralHome(fhList[0]);
      } else if (resolvedCase?.created_by) {
        base44.entities.FuneralHome.filter({ created_by: resolvedCase.created_by }, "-created_date", 1)
          .then(([fh]) => { if (fh) setFuneralHome(fh); });
      }
      // increment visit count
      base44.entities.B2BMemorialPage.update(p.id, { visit_count: (p.visit_count || 0) + 1 }).catch(() => {});
      setLoading(false);
    });
  }, [slug]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    setUploading(false);
  };

  const submit = async () => {
    if (!form.contributor_name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    await base44.entities.B2BContribution.create({
      memorial_page_id: page.id,
      contributor_name: form.contributor_name,
      message: form.message,
      photo_url: photoUrl,
      is_candle: form.is_candle,
    });
    await base44.entities.B2BMemorialPage.update(page.id, {
      contribution_count: (page.contribution_count || 0) + 1,
      candle_count: form.is_candle ? (page.candle_count || 0) + 1 : (page.candle_count || 0),
    });
    setSubmitting(false);
    setSubmitted(true);
    setForm({ contributor_name: "", message: "", is_candle: false });
    setPhotoUrl("");
    // Re-fetch contributions
    const updated = await base44.entities.B2BContribution.filter({ memorial_page_id: page.id }, "-created_date");
    setContributions(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f3ed" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#c9a96e" }} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6" style={{ background: "#f7f3ed" }}>
        <div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>Gedenkseite nicht gefunden</h2>
          <p style={{ color: "#8a8278" }}>Der Link ist möglicherweise ungültig oder die Seite wurde entfernt.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f3ed", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>

      {/* White-label top banner */}
      {/* Top banner — always visible */}
      <div className="flex items-center justify-center gap-3 px-6" style={{ height: 40, background: "rgba(15,14,12,0.95)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
        {funeralHome?.whitelabel_enabled ? (
          <>
            {funeralHome.logo_url && <img src={funeralHome.logo_url} alt={funeralHome.name} className="object-contain object-face" style={{ maxHeight: 22 }} />}
            <span className="text-sm font-medium" style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{funeralHome.name}</span>
          </>
        ) : (
          <>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e", fontSize: 15, letterSpacing: "0.02em" }}>
              ✦ <span style={{ color: "#f0ede8" }}>Ever</span>trace
            </span>
            <a href="/" style={{ marginLeft: "auto", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a8278", textDecoration: "none" }}>Auch eine erstellen →</a>
          </>
        )}
      </div>

      {/* Hero */}
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20"
        style={{ background: page.main_photo_url ? `url(${page.main_photo_url}) center/cover no-repeat` : "linear-gradient(160deg,#1c1917,#2c2010)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="relative text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "rgba(201,169,110,0.5)" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c9a96e" }} />
            <div className="h-px w-10" style={{ background: "rgba(201,169,110,0.5)" }} />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#c9a96e" }}>In liebevoller Erinnerung</p>
          <h1 className="text-5xl md:text-6xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Gedenkseite"}
          </h1>
          {(caseData?.date_of_birth || caseData?.date_of_death) && (
            <p className="text-base text-stone-300 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
              {caseData.date_of_birth && `* ${fmtDate(caseData.date_of_birth)}`}
              {caseData.date_of_birth && caseData.date_of_death && " · "}
              {caseData.date_of_death && `† ${fmtDate(caseData.date_of_death)}`}
            </p>
          )}
          {page.funeral_date && (
            <p className="text-sm tracking-widest text-stone-400">
              Trauerfeier: {fmtDate(page.funeral_date)}
              {page.funeral_location ? ` · ${page.funeral_location}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* QR Share Panel */}
      <section className="py-8 px-6" style={{ background: "#f0ebe1", borderBottom: "1px solid #e8dfd0" }}>
        <div className="max-w-2xl mx-auto">
          <QrSharePanel memorial={{
            short_id: slug,
            name: caseData ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}` : "Gedenkseite"
          }} />
        </div>
      </section>

      {/* Management bar — visible only to logged-in users */}
      {user && (
        <div className="px-6 py-3 flex items-center justify-end gap-3" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <button onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            <BookOpen className="w-4 h-4" /> Gedenkbuch drucken
          </button>
        </div>
      )}

      {/* Biography */}
      {page.biography && (
        <section className="py-20 px-6" style={{ background: "white" }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#c9a96e" }}>Lebensgeschichte</p>
            <p className="text-lg leading-9 italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#4a3f35" }}>
              {page.biography}
            </p>
          </div>
        </section>
      )}

      {/* Candles & stats */}
      <section className="py-14 px-6 text-center" style={{ background: "#f0ebe1" }}>
        <div className="flex flex-wrap items-center justify-center gap-y-8 gap-x-10">
          <div>
            <p className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>{page.visit_count || 0}</p>
            <p className="text-xs mt-1" style={{ color: "#8a8278" }}>Besuche</p>
          </div>
          <div className="w-px h-10" style={{ background: "#d4c5a9" }} />
          <div>
            <p className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>{page.candle_count || 0}</p>
            <p className="text-xs mt-1" style={{ color: "#8a8278" }}>Kerzen</p>
          </div>
          <div className="w-px h-10" style={{ background: "#d4c5a9" }} />
          <div>
            <p className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>{page.contribution_count || 0}</p>
            <p className="text-xs mt-1" style={{ color: "#8a8278" }}>Beiträge</p>
          </div>
        </div>
      </section>

      {/* Contributions */}
      {contributions.length > 0 && (
        <section className="py-16 px-6" style={{ background: "white" }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] mb-8 text-center" style={{ color: "#c9a96e" }}>Gedenkbuch</p>
            <div className="space-y-5">
              {contributions.map(c => (
                <div key={c.id} className="p-6 rounded-2xl" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                      {c.contributor_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2c2419" }}>{c.contributor_name}</p>
                      <p className="text-xs" style={{ color: "#8a8278" }}>{fmtDate(c.created_date)}</p>
                    </div>
                    {c.is_candle && <Flame className="w-4 h-4 ml-auto" style={{ color: "#c9a96e" }} />}
                  </div>
                  <p className="text-sm leading-7 italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#4a3f35" }}>
                    „{c.message}"
                  </p>
                  {c.photo_url && <img src={c.photo_url} alt="" className="mt-4 w-full max-h-48 object-cover object-face rounded-xl" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contribution form */}
      <section className="py-16 px-6" style={{ background: "#f7f3ed" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-center" style={{ color: "#c9a96e" }}>Erinnerung hinterlassen</p>
          <h2 className="text-3xl font-semibold text-center mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>
            Teilen Sie Ihre Erinnerungen
          </h2>

          {submitted ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "white", border: "1px solid #e8dfd0" }}>
              <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: "#c9a96e" }} />
              <p className="font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2c2419" }}>Vielen Dank für Ihre Worte</p>
              <p className="text-sm" style={{ color: "#8a8278" }}>Ihre Erinnerung wurde hinzugefügt.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm" style={{ color: "#c9a96e" }}>Weitere Erinnerung →</button>
            </div>
          ) : (
            <div className="rounded-2xl p-8" style={{ background: "white", border: "1px solid #e8dfd0" }}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Ihr Name</label>
                  <input value={form.contributor_name} onChange={e => set("contributor_name", e.target.value)} placeholder="Vor- und Nachname"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", color: "#2c2419", fontSize: 16 }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Ihre Erinnerung</label>
                  <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4}
                    placeholder="Teilen Sie eine Erinnerung, ein Gebet oder einfach Ihr Mitgefühl…"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", color: "#2c2419", fontSize: 16 }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => set("is_candle", !form.is_candle)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all flex-1"
                    style={{ background: form.is_candle ? "rgba(201,169,110,0.15)" : "#f7f3ed", border: `1px solid ${form.is_candle ? "#c9a96e" : "#e8dfd0"}`, color: form.is_candle ? "#c9a96e" : "#8a8278" }}>
                    <Flame className="w-4 h-4" /> Kerze anzünden
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer flex-1" style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", color: "#8a8278" }}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {photoUrl ? "Foto hochgeladen" : "Foto hochladen"}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                  </label>
                </div>
                <button onClick={submit} disabled={submitting || !form.contributor_name.trim() || !form.message.trim()}
                  className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                  Erinnerung hinterlassen
                </button>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Edit button — fixed bottom bar for logged-in users in edit mode */}
      {editMode && user && page && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3" style={{ background: "#181714", borderTop: "1px solid #c9a96e", height: 60 }}>
          <span className="text-xs font-medium" style={{ color: "#c9a96e" }}>✦ Bearbeitungsmodus</span>
          <button
            onClick={() => { setEditForm({ ...page }); setShowEditPanel(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            <Pencil className="w-3.5 h-3.5" /> Gedenkseite bearbeiten
          </button>
        </div>
      )}

      {/* Full Edit Panel */}
      {showEditPanel && editForm && (
        <div className="fixed inset-0 z-[60] flex" style={{ background: "rgba(0,0,0,0.6)" }}>
          {/* Backdrop close */}
          <div className="flex-1" onClick={() => setShowEditPanel(false)} />
          {/* Drawer */}
          <div className="w-full max-w-md h-full overflow-y-auto flex flex-col" style={{ background: "#181714", borderLeft: "1px solid #302d28" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: "#302d28" }}>
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Gedenkseite bearbeiten</h2>
              <button onClick={() => setShowEditPanel(false)} style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
            </div>

            {/* Fields */}
            <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">

              {/* Photo */}
              <div>
                <p className="text-xs mb-2" style={{ color: "#8a8278" }}>Hauptfoto</p>
                {editForm.main_photo_url ? (
                  <div className="relative">
                    <img src={editForm.main_photo_url} alt="" className="w-full h-36 object-cover rounded-xl" style={{ objectPosition: "center 25%" }} />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl" style={{ background: "rgba(0,0,0,0.4)" }}>
                      <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ background: "rgba(201,169,110,0.9)", color: "#0f0e0c" }}>
                        {uploadingHero ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {uploadingHero ? "Lädt…" : "Foto ändern"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingHero} onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploadingHero(true);
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          setEditForm(f => ({ ...f, main_photo_url: file_url }));
                          setUploadingHero(false);
                        }} />
                      </label>
                      <button onClick={() => setEditForm(f => ({ ...f, main_photo_url: "" }))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#f0ede8" }}>
                        <X className="w-3 h-3" /> Entfernen
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 rounded-xl cursor-pointer border-2 border-dashed"
                    style={{ borderColor: "#302d28", color: "#5a554e" }}>
                    {uploadingHero ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5 mb-1" /><span className="text-xs">Foto hochladen</span></>}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingHero} onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingHero(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setEditForm(f => ({ ...f, main_photo_url: file_url }));
                      setUploadingHero(false);
                    }} />
                  </label>
                )}
              </div>

              {/* Biography */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Biografie / Lebensgeschichte</p>
                <textarea value={editForm.biography || ""} onChange={e => setEditForm(f => ({ ...f, biography: e.target.value }))}
                  rows={6} placeholder="Lebensgeschichte der verstorbenen Person…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", lineHeight: 1.7 }} />
              </div>

              {/* Funeral date + location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Datum der Trauerfeier</p>
                  <input type="date" value={editForm.funeral_date || ""}
                    onChange={e => setEditForm(f => ({ ...f, funeral_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
                <div>
                  <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Ort der Trauerfeier</p>
                  <input value={editForm.funeral_location || ""} onChange={e => setEditForm(f => ({ ...f, funeral_location: e.target.value }))}
                    placeholder="z. B. Friedhof Mühlstraße"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
              </div>

              {/* Privacy */}
              <div>
                <p className="text-xs mb-2" style={{ color: "#8a8278" }}>Sichtbarkeit</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "public", label: "Öffentlich", icon: Globe, color: "#4ade80" },
                    { id: "link", label: "Nur Link", icon: Link2, color: "#c9a96e" },
                    { id: "private", label: "Privat", icon: Lock, color: "#8a8278" },
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button key={id} onClick={() => setEditForm(f => ({ ...f, privacy: id }))}
                      className="p-2.5 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-all"
                      style={{ background: editForm.privacy === id ? `${color}18` : "#201e1a", border: `1px solid ${editForm.privacy === id ? color : "#302d28"}`, color: editForm.privacy === id ? color : "#5a554e" }}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked memorial */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: "#8a8278" }}>Verknüpfte vollständige Gedenkseite (Short-ID)</p>
                <input value={editForm.linked_memorial_short_id || ""} onChange={e => setEditForm(f => ({ ...f, linked_memorial_short_id: e.target.value }))}
                  placeholder="z. B. AB12CD34"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                {editForm.linked_memorial_short_id && (
                  <a href={`/MemorialProfile?id=${editForm.linked_memorial_short_id}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "#c9a96e" }}>
                    <ExternalLink className="w-3 h-3" /> Vorschau öffnen
                  </a>
                )}
              </div>
            </div>

            {/* Save footer */}
            <div className="flex gap-3 px-6 py-5 border-t flex-shrink-0" style={{ borderColor: "#302d28" }}>
              <button onClick={() => setShowEditPanel(false)}
                className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>
                Abbrechen
              </button>
              <button disabled={savingEdit} onClick={async () => {
                setSavingEdit(true);
                await base44.entities.B2BMemorialPage.update(page.id, {
                  biography: editForm.biography,
                  funeral_date: editForm.funeral_date,
                  funeral_location: editForm.funeral_location,
                  privacy: editForm.privacy,
                  main_photo_url: editForm.main_photo_url,
                  linked_memorial_short_id: editForm.linked_memorial_short_id,
                });
                setPage({ ...page, ...editForm });
                setSavingEdit(false);
                setShowEditPanel(false);
              }}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintModal && (
        <CondolenceBookPrintModal
          page={page}
          caseData={caseData}
          contributions={contributions}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Footer */}
      <div className="py-8 text-center" style={{ background: "#1a1410" }}>
        {funeralHome?.whitelabel_enabled && funeralHome?.logo_url ? (
          <div className="flex flex-col items-center gap-2">
            {funeralHome.logo_url && <img src={funeralHome.logo_url} alt={funeralHome.name} className="object-contain object-face" style={{ maxHeight: 32 }} />}
            {funeralHome.name && <p className="text-sm font-medium" style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif" }}>{funeralHome.name}</p>}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "#5a554e", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            Erstellt mit <a href="/" style={{ color: "#c9a96e" }}>Evertrace</a>
          </p>
        )}
      </div>
    </div>
  );
}