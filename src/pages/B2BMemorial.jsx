import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import {
  Plus, Globe, Eye, Lock, Link2, Sparkles, Loader2, X,
  ExternalLink, Pencil, RefreshCw, Flame, Copy, Mail,
  Star, Users, BookOpen, Settings
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const PRIVACY_CONFIG = {
  public: { label: "Öffentlich", icon: Globe, color: "#4ade80" },
  link:   { label: "Nur mit Link", icon: Link2, color: "#c9a96e" },
  private:{ label: "Privat", icon: Lock, color: "#8a8278" },
};

function slugify(str) {
  return str.toLowerCase()
    .replace(/[äöü]/g, c => ({ ä: "ae", ö: "oe", ü: "ue" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  case_id: "", biography: "", funeral_date: "", funeral_location: "",
  privacy: "public", main_photo_url: "", linked_memorial_short_id: ""
};

// ── Share helpers ──────────────────────────────────────────────────────────────
function CopyLinkButton({ url, small }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
      style={{ background: "#201e1a", color: copied ? "#4ade80" : "#c9a96e", border: `1px solid ${copied ? "#4ade80" : "#302d28"}` }}>
      <Copy className="w-3 h-3" /> {copied ? "Kopiert ✓" : "Link kopieren"}
    </button>
  );
}

function MailShareButton({ url, name, funeralHome, nextOfKinEmail }) {
  const subject = `Gedenkseite für ${name}`;
  const body = `Sehr geehrte Familie,\n\nwir haben eine digitale Gedenkseite für ${name} erstellt, auf der Sie Erinnerungen teilen, Kerzen anzünden und Beiträge hinterlassen können.\n\nHier ist der Link:\n${url}\n\nMit herzlicher Anteilnahme,\n${funeralHome?.name || "Ihr Bestattungshaus"}`;
  return (
    <a
      href={`mailto:${nextOfKinEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-all"
      style={{ background: "#201e1a", color: "#8a8278", border: "1px solid #302d28" }}>
      <Mail className="w-3 h-3" /> Per E-Mail
    </a>
  );
}

// ── B2B Memorial Page Card ─────────────────────────────────────────────────────
function B2BPageCard({ page, c, funeralHome }) {
  const priv = PRIVACY_CONFIG[page.privacy] || PRIVACY_CONFIG.public;
  const PrivIcon = priv.icon;
  const name = c ? `${c.deceased_first_name} ${c.deceased_last_name}` : "Unbekannte Person";
  const publicUrl = `${window.location.origin}/B2BPublicMemorial?slug=${page.slug}`;

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "#181714", border: "1px solid #302d28" }}>
      {page.main_photo_url ? (
        <div className="h-36 overflow-hidden flex-shrink-0">
          <img src={page.main_photo_url} alt={name} className="w-full h-full object-cover" style={{ objectPosition: "center 25%" }} />
        </div>
      ) : (
        <div className="h-36 flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1c19,#141210)" }}>
          <Globe className="w-8 h-8" style={{ color: "#302d28" }} />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-base leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{name}</h3>
          {c && (c.date_of_birth || c.date_of_death) && (
            <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>
              {c.date_of_birth && `* ${fmtDate(c.date_of_birth)}`}{c.date_of_birth && c.date_of_death && " · "}{c.date_of_death && `† ${fmtDate(c.date_of_death)}`}
            </p>
          )}
          {page.funeral_date && (
            <p className="text-xs mt-0.5" style={{ color: "#8a8278" }}>Trauerfeier: {fmtDate(page.funeral_date)}{page.funeral_location ? ` · ${page.funeral_location}` : ""}</p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "#5a554e" }}>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {page.visit_count || 0}</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {page.candle_count || 0}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {page.contribution_count || 0}</span>
          <span className="flex items-center gap-1 ml-auto" style={{ color: priv.color }}><PrivIcon className="w-3 h-3" /> {priv.label}</span>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex gap-2">
            <a href={`/B2BPublicMemorial?slug=${page.slug}&edit=true`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              <Pencil className="w-3 h-3" /> Bearbeiten
            </a>
            <a href={`/B2BPublicMemorial?slug=${page.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: "#201e1a", color: "#c9a96e", border: "1px solid #302d28" }}>
              <ExternalLink className="w-3 h-3" /> Ansehen
            </a>
          </div>
          <div className="flex gap-2">
            <CopyLinkButton url={publicUrl} />
            <MailShareButton url={publicUrl} name={name} funeralHome={funeralHome} nextOfKinEmail={c?.next_of_kin_email} />
          </div>
          {page.linked_memorial_short_id && (
            <a href={`/MemorialProfile?id=${page.linked_memorial_short_id}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
              style={{ background: "rgba(201,169,110,0.08)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.25)" }}>
              <ExternalLink className="w-3 h-3" /> Verknüpfte B2C-Gedenkseite →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Full Memorial Card (B2C) ───────────────────────────────────────────────────
function FullMemorialCard({ memorial, funeralHome }) {
  const memUrl = `${window.location.origin}/MemorialProfile?id=${memorial.short_id}`;
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "#181714", border: "1px solid rgba(201,169,110,0.25)" }}>
      {/* Gold badge: "Vollständige Gedenkseite" */}
      <div className="px-4 pt-3 pb-0 flex items-center gap-1.5">
        <Star className="w-3 h-3" style={{ color: "#c9a96e" }} />
        <span className="text-xs font-medium" style={{ color: "#c9a96e" }}>Vollständige Gedenkseite</span>
      </div>

      {memorial.hero_image_url ? (
        <div className="h-36 overflow-hidden flex-shrink-0 mx-0 mt-3">
          <img src={memorial.hero_image_url} alt={memorial.name} className="w-full h-full object-cover"
            style={{ objectPosition: `center ${memorial.hero_image_position ?? 30}%` }} />
        </div>
      ) : (
        <div className="h-36 flex-shrink-0 flex items-center justify-center mt-3" style={{ background: "linear-gradient(135deg,#1e1c19,#141210)" }}>
          <BookOpen className="w-8 h-8" style={{ color: "#302d28" }} />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-base leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{memorial.name}</h3>
          {(memorial.birth_date || memorial.death_date) && (
            <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>
              {memorial.birth_date && `* ${fmtDate(memorial.birth_date)}`}
              {memorial.birth_date && memorial.death_date && " · "}
              {memorial.death_date && `† ${fmtDate(memorial.death_date)}`}
            </p>
          )}
          <p className="text-xs mt-0.5" style={{ color: "#8a8278" }}>
            {memorial.plan === "premium" ? "Premium" : memorial.plan === "classic" ? "Classic" : "Free"} · {memorial.status}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "#5a554e" }}>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {memorial.candle_count || 0} Kerzen</span>
          <span className="flex items-center gap-1 ml-auto" style={{ color: memorial.is_private ? "#8a8278" : "#4ade80" }}>
            {memorial.is_private ? <><Lock className="w-3 h-3" /> Privat</> : <><Globe className="w-3 h-3" /> Öffentlich</>}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex gap-2">
            {/* Full edit — same as B2C user */}
            <a href={`/EditMemorial?id=${memorial.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              <Settings className="w-3 h-3" /> Vollständig bearbeiten
            </a>
            <a href={`/MemorialProfile?id=${memorial.short_id}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: "#201e1a", color: "#c9a96e", border: "1px solid #302d28" }}>
              <ExternalLink className="w-3 h-3" /> Ansehen
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(memUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
              style={{ background: "#201e1a", color: copied ? "#4ade80" : "#c9a96e", border: `1px solid ${copied ? "#4ade80" : "#302d28"}` }}>
              <Copy className="w-3 h-3" /> {copied ? "Kopiert ✓" : "Link kopieren"}
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Gedenkseite für ${memorial.name}`)}&body=${encodeURIComponent(`Digitale Gedenkseite für ${memorial.name}:\n${memUrl}\n\nMit freundlichen Grüßen,\n${funeralHome?.name || "Ihr Bestattungshaus"}`)}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
              style={{ background: "#201e1a", color: "#8a8278", border: "1px solid #302d28" }}>
              <Mail className="w-3 h-3" /> Per E-Mail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function B2BMemorial() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const preselectedCaseId = params.get("case_id");

  const [activeTab, setActiveTab] = useState("full"); // "full" | "b2b"
  const [funeralHome, setFuneralHome] = useState(null);
  const [b2bPages, setB2bPages] = useState([]);
  const [fullMemorials, setFullMemorials] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // B2B create modal
  const [showModal, setShowModal] = useState(!!preselectedCaseId);
  const [form, setForm] = useState({ ...EMPTY_FORM, case_id: preselectedCaseId || "" });
  const [uploading, setUploading] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        const fhList = await base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1);
        if (!fhList.length) { navigate("/B2BRegister"); return; }
        const fh = fhList[0];
        setFuneralHome(fh);

        const [allCases, allB2BPages, userB2BPages, ownMemorials] = await Promise.all([
          base44.entities.Case.filter({ funeral_home_id: fh.id }, "-created_date", 200),
          base44.entities.B2BMemorialPage.filter({ funeral_home_id: fh.id }, "-created_date", 200),
          base44.entities.B2BMemorialPage.filter({ created_by: u.email }, "-created_date", 200),
          base44.entities.Memorial.filter({ created_by: u.email }, "-created_date", 100),
        ]);

        setCases(allCases);

        // Deduplicate B2B pages
        const pageMap = new Map();
        [...allB2BPages, ...userB2BPages].forEach(p => pageMap.set(p.id, p));
        setB2bPages([...pageMap.values()].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

        // Full memorials: own + those where user is collaborator
        // Also fetch memorials linked via funeral_home_case_id
        const caseIds = new Set(allCases.map(c => c.id));
        const linkedMemorials = await base44.entities.Memorial.filter({ funeral_home_case_id: allCases[0]?.id }, "-created_date", 50).catch(() => []);
        // Try to get ALL memorials where this bestatter is collaborator (collab invite flow)
        // We can only do this by fetching memorials containing u.email in collaborator_emails
        // Since we can't query arrays, we fall back to: ownMemorials + case-linked ones
        const memMap = new Map();
        [...ownMemorials, ...linkedMemorials].forEach(m => memMap.set(m.id, m));
        // Also check linked_memorial_short_id from B2B pages
        const shortIds = [...pageMap.values()].map(p => p.linked_memorial_short_id).filter(Boolean);
        if (shortIds.length) {
          const linked = await Promise.all(shortIds.map(sid =>
            base44.entities.Memorial.filter({ short_id: sid }, "-created_date", 1).catch(() => [])
          ));
          linked.flat().forEach(m => memMap.set(m.id, m));
        }

        setFullMemorials([...memMap.values()].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch (e) {
        setError("Fehler beim Laden der Daten.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const getCase = (id) => cases.find(c => c.id === id);

  const generateBio = async () => {
    const c = getCase(form.case_id);
    if (!c) return;
    setGeneratingBio(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Schreibe eine würdevolle, kurze Biografie (3–4 Sätze) auf Deutsch für ${c.deceased_first_name} ${c.deceased_last_name}, geboren ${fmtDate(c.date_of_birth)}, gestorben ${fmtDate(c.date_of_death)}. Bestattungsart: ${c.burial_type}. Warm und persönlich.`,
    });
    set("biography", typeof result === "string" ? result : "");
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

  const saveB2BPage = async () => {
    if (!form.case_id) return;
    setSaving(true);
    const c = getCase(form.case_id);
    const slug = c
      ? `${slugify(c.deceased_first_name)}-${slugify(c.deceased_last_name)}-${Date.now().toString(36)}`
      : `gedenkseite-${Date.now().toString(36)}`;
    const page = await base44.entities.B2BMemorialPage.create({ ...form, slug, funeral_home_id: funeralHome?.id || "" });
    await base44.entities.Case.update(form.case_id, { has_memorial: true });
    setB2bPages(prev => [page, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaving(false);
    setActiveTab("b2b");
  };

  const TABS = [
    { id: "full", label: `Vollständige Gedenkseiten (${fullMemorials.length})` },
    { id: "b2b", label: `Einfache Gedenkseiten (${b2bPages.length})` },
  ];

  return (
    <B2BLayout
      title="Gedenkseiten"
      subtitle="Vollständige und einfache Gedenkseiten verwalten"
      action={
        <div className="flex gap-2 flex-wrap">
          <Link to="/CreateMemorial"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
            <Plus className="w-4 h-4" /> Vollständige Gedenkseite
          </Link>
          <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            <Plus className="w-4 h-4" /> Einfache Gedenkseite
          </button>
        </div>
      }
    >
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#181714", border: "1px solid #302d28", width: "fit-content", maxWidth: "100%" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: activeTab === t.id ? "#c9a96e" : "transparent", color: activeTab === t.id ? "#0f0e0c" : "#5a554e" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}
        </div>
      )}

      {error && (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#181714", border: "1px solid #c9a96e" }}>
          <p style={{ color: "#c9a96e" }}>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 flex items-center gap-2 mx-auto text-sm" style={{ color: "#8a8278" }}>
            <RefreshCw className="w-4 h-4" /> Neu laden
          </button>
        </div>
      )}

      {!loading && !error && activeTab === "full" && (
        <>
          {/* Explanation */}
          <div className="mb-5 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c9a96e" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#c9a96e" }}>Vollständige Gedenkseiten — voller Funktionsumfang</p>
              <p className="text-xs mt-1" style={{ color: "#8a8278" }}>
                Biografie, Fotos, Timeline, Stammbaum, Musik, Kondolenzbuch, Jahrestags-Erinnerungen, QR-Plakett-Bestellung — alles was Evertrace bietet.
                Erstellen Sie diese Seite für Ihre Kunden und fügen Sie sich als Mitbearbeiter hinzu.
              </p>
            </div>
          </div>

          {fullMemorials.length === 0 ? (
            <div className="rounded-2xl py-20 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <Star className="w-10 h-10 mx-auto mb-4" style={{ color: "#302d28" }} />
              <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Noch keine vollständigen Gedenkseiten</p>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "#5a554e" }}>
                Erstellen Sie eine vollständige Gedenkseite für Ihre Kunden — mit allen Inhalten, Timeline, Fotos und Musik.
              </p>
              <Link to="/CreateMemorial"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                <Plus className="w-4 h-4" /> Jetzt erstellen
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {fullMemorials.map(m => (
                <FullMemorialCard key={m.id} memorial={m} funeralHome={funeralHome} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && activeTab === "b2b" && (
        <>
          <div className="mb-5 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#60a5fa" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#60a5fa" }}>Einfache Gedenkseiten — schnell & unkompliziert</p>
              <p className="text-xs mt-1" style={{ color: "#8a8278" }}>
                Schnell erstellt: Biografie, Foto, Kondolenzeinträge. Ideal für Familien die eine einfache Online-Gedenkseite wünschen.
              </p>
            </div>
          </div>

          {b2bPages.length === 0 ? (
            <div className="rounded-2xl py-20 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <Globe className="w-10 h-10 mx-auto mb-4" style={{ color: "#302d28" }} />
              <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Noch keine einfachen Gedenkseiten</p>
              <p className="text-sm mb-6" style={{ color: "#5a554e" }}>Einfache Gedenkseiten sind in wenigen Minuten erstellt.</p>
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                <Plus className="w-4 h-4" /> Erste einfache Gedenkseite
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {b2bPages.map(page => (
                <B2BPageCard key={page.id} page={page} c={getCase(page.case_id)} funeralHome={funeralHome} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Create Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl p-7 relative max-h-[90vh] overflow-y-auto" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5" style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Einfache Gedenkseite</h2>
            <p className="text-xs mb-6" style={{ color: "#5a554e" }}>Schnell erstellt. Für vollständige Seiten mit Timeline, Familie etc. → "Vollständige Gedenkseite".</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Fall auswählen *</label>
                <select value={form.case_id} onChange={e => set("case_id", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: form.case_id ? "#f0ede8" : "#5a554e" }}>
                  <option value="">— Bitte wählen —</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.deceased_first_name} {c.deceased_last_name}{c.date_of_death ? ` · † ${fmtDate(c.date_of_death)}` : ""}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs" style={{ color: "#8a8278" }}>Biografie</label>
                  <button onClick={generateBio} disabled={!form.case_id || generatingBio}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg disabled:opacity-40"
                    style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.25)" }}>
                    {generatingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} KI-Entwurf
                  </button>
                </div>
                <textarea value={form.biography} onChange={e => set("biography", e.target.value)} rows={4}
                  placeholder="Biografie oder kurze Beschreibung…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Datum Trauerfeier</label>
                  <input type="date" value={form.funeral_date} onChange={e => set("funeral_date", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Ort der Trauerfeier</label>
                  <input value={form.funeral_location} onChange={e => set("funeral_location", e.target.value)} placeholder="z. B. Friedhof Mühlstraße"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                </div>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Datenschutz</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PRIVACY_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => set("privacy", key)}
                        className="p-2.5 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-all"
                        style={{ background: form.privacy === key ? `${cfg.color}18` : "#201e1a", border: `1px solid ${form.privacy === key ? cfg.color : "#302d28"}`, color: form.privacy === key ? cfg.color : "#8a8278" }}>
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
                    <img src={form.main_photo_url} alt="" className="w-full h-32 object-cover rounded-xl" style={{ objectPosition: "center 25%" }} />
                    <button onClick={() => set("main_photo_url", "")} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 rounded-xl cursor-pointer border-2 border-dashed" style={{ borderColor: "#302d28", color: "#5a554e" }}>
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mb-1" /><span className="text-xs">Foto hochladen</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Abbrechen</button>
              <button onClick={saveB2BPage} disabled={saving || !form.case_id}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}