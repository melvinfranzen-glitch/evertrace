import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, Feather, Upload, Flame, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
  const [copied, setCopied] = useState(false);

  const slug = new URLSearchParams(window.location.search).get("slug");
  const pageUrl = window.location.href;

  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
      if (cases[0]) setCaseData(cases[0]);
      if (fhList[0]) setFuneralHome(fhList[0]);
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
      {/* Hero */}
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20"
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

      {/* Share section */}
      <section className="py-8 px-6" style={{ background: "#f0ebe1", borderBottom: "1px solid #e8dfd0" }}>
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={copyUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-full sm:w-auto justify-center"
            style={{ background: copied ? "rgba(74,222,128,0.1)" : "white", border: `1px solid ${copied ? "#4ade80" : "#e8dfd0"}`, color: copied ? "#4ade80" : "#4a3f35" }}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Link kopiert!" : "Link kopieren"}
          </button>
          <a href={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pageUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-full sm:w-auto justify-center"
            style={{ background: "white", border: "1px solid #e8dfd0", color: "#4a3f35" }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=24x24&data=${encodeURIComponent(pageUrl)}`} alt="QR" className="w-5 h-5" />
            QR-Code anzeigen
          </a>
        </div>
      </section>

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
        <div className="flex items-center justify-center gap-10">
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
                  {c.photo_url && <img src={c.photo_url} alt="" className="mt-4 w-full max-h-48 object-cover rounded-xl" />}
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
                    style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", color: "#2c2419" }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Ihre Erinnerung</label>
                  <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4}
                    placeholder="Teilen Sie eine Erinnerung, ein Gebet oder einfach Ihr Mitgefühl…"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#f7f3ed", border: "1px solid #e8dfd0", color: "#2c2419" }} />
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

      {/* Footer */}
      <div className="py-8 text-center" style={{ background: "#1a1410" }}>
        <p className="text-xs" style={{ color: "#5a554e", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          Erstellt mit Evertrace
        </p>
      </div>
    </div>
  );
}