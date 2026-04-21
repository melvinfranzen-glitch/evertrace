import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { ArrowLeft, CreditCard, Globe, Package, Clock, CheckCircle2, Pencil, X, Check, Users } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

function fmtDateTime(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy HH:mm", { locale: de }); }
  catch { return d; }
}

const STATUS_COLORS = { aktiv: "#c9a96e", abgeschlossen: "#4ade80", archiviert: "#5a554e" };
const BURIAL_TYPES = ["Erdbestattung", "Feuerbestattung", "Seebestattung", "Waldbestattung", "Urnenbeisetzung"];
const STATUS_OPTS = ["aktiv", "abgeschlossen", "archiviert"];

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
      <h3 className="text-lg font-semibold mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b" style={{ borderColor: "#302d28" }}>
      <span className="text-sm" style={{ color: "#8a8278" }}>{label}</span>
      <span className="text-sm text-right" style={{ color: "#f0ede8" }}>{value || "—"}</span>
    </div>
  );
}

export default function B2BCaseDetail() {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [cards, setCards] = useState([]);
  const [memorial, setMemorial] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!id) return;
    base44.auth.me().then(user => {
      setCurrentUser(user);
      Promise.all([
        base44.entities.Case.filter({ id }),
        base44.entities.MourningCard.filter({ case_id: id }),
        base44.entities.B2BMemorialPage.filter({ case_id: id }),
        base44.entities.PrintOrder.filter({ case_id: id }),
      ]).then(([cases, k, mem, o]) => {
        if (cases.length && cases[0].created_by !== user.email) {
          navigate("/B2BCases");
          return;
        }
        if (cases.length) setCaseData(cases[0]);
        setCards(k);
        if (mem.length) setMemorial(mem[0]);
        setOrders(o);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <B2BLayout title="Fall-Details">
      <div className="space-y-5">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}</div>
    </B2BLayout>
  );

  const openEdit = () => { setEditForm({ ...caseData }); setEditing(true); };
  const setF = (k, v) => setEditForm(p => ({ ...p, [k]: v }));
  const saveEdit = async () => {
    setSaving(true);
    await base44.entities.Case.update(caseData.id, editForm);
    setCaseData({ ...caseData, ...editForm });
    setEditing(false);
    setSaving(false);
  };

  if (!caseData) return (
    <B2BLayout title="Fall-Details">
      <div className="text-center py-20" style={{ color: "#5a554e" }}>Fall nicht gefunden.</div>
    </B2BLayout>
  );

  const timeline = [
    { date: caseData.created_date, label: "Fall angelegt", icon: CheckCircle2, color: "#c9a96e" },
    ...cards.map(k => ({ date: k.created_date, label: `Trauerkarte erstellt (${k.format || ""})`, icon: CreditCard, color: "#c9a96e" })),
    ...(memorial ? [{ date: memorial.created_date, label: "Gedenkseite erstellt", icon: Globe, color: "#4ade80" }] : []),
    ...orders.map(o => ({ date: o.created_date, label: `Bestellung: ${o.order_type} (${o.quantity} Stk.)`, icon: Package, color: "#60a5fa" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <B2BLayout
      title={`${caseData.deceased_first_name} ${caseData.deceased_last_name}`}
      subtitle={`Fall-Details · ${fmtDate(caseData.date_of_birth)} – ${fmtDate(caseData.date_of_death)}`}
      action={
        <div className="flex items-center gap-3">
          <button onClick={openEdit} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all" style={{ borderColor: "#c9a96e", color: "#c9a96e" }}>
            <Pencil className="w-4 h-4" /> Bearbeiten
          </button>
          <Link to="/B2BCases" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all" style={{ borderColor: "#302d28", color: "#8a8278" }}>
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Angaben zur verstorbenen Person">
            <InfoRow label="Vollständiger Name" value={`${caseData.deceased_first_name} ${caseData.deceased_last_name}`} />
            <InfoRow label="Geburtsdatum" value={fmtDate(caseData.date_of_birth)} />
            <InfoRow label="Sterbedatum" value={fmtDate(caseData.date_of_death)} />
            <InfoRow label="Bestattungsart" value={caseData.burial_type} />
            <InfoRow label="Status" value={<span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${STATUS_COLORS[caseData.status]}20`, color: STATUS_COLORS[caseData.status] }}>{caseData.status}</span>} />
          </Section>

          <Section title="Angehörige/r">
            <InfoRow label="Name" value={caseData.next_of_kin_name} />
            <InfoRow label="E-Mail" value={caseData.next_of_kin_email} />
            <InfoRow label="Telefon" value={caseData.next_of_kin_phone} />
          </Section>

          {/* Services */}
          <Section title="Verknüpfte Dienste">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to={`/B2BCardWizard?case_id=${caseData.id}`}
                className="p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all border"
                style={{ background: cards.length ? "rgba(201,169,110,0.06)" : "#201e1a", borderColor: cards.length ? "#c9a96e" : "#302d28" }}>
                <CreditCard className="w-6 h-6" style={{ color: cards.length ? "#c9a96e" : "#5a554e" }} />
                <span className="text-sm font-medium" style={{ color: "#f0ede8" }}>Trauerkarte</span>
                <span className="text-xs" style={{ color: "#5a554e" }}>{cards.length ? `${cards.length} erstellt` : "Erstellen"}</span>
              </Link>
              <Link to={`/B2BMemorial?case_id=${caseData.id}`}
                className="p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all border"
                style={{ background: memorial ? "rgba(74,222,128,0.06)" : "#201e1a", borderColor: memorial ? "#4ade80" : "#302d28" }}>
                <Globe className="w-6 h-6" style={{ color: memorial ? "#4ade80" : "#5a554e" }} />
                <span className="text-sm font-medium" style={{ color: "#f0ede8" }}>B2B-Gedenkseite</span>
                <span className="text-xs" style={{ color: "#5a554e" }}>{memorial ? "Aktiv" : "Erstellen"}</span>
              </Link>
              <Link to={`/B2BOrders?case_id=${caseData.id}`}
                className="p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all border"
                style={{ background: orders.length ? "rgba(96,165,250,0.06)" : "#201e1a", borderColor: orders.length ? "#60a5fa" : "#302d28" }}>
                <Package className="w-6 h-6" style={{ color: orders.length ? "#60a5fa" : "#5a554e" }} />
                <span className="text-sm font-medium" style={{ color: "#f0ede8" }}>Bestellungen</span>
                <span className="text-xs" style={{ color: "#5a554e" }}>{orders.length ? `${orders.length} Bestellungen` : "Keine"}</span>
              </Link>
            </div>

            {/* Full B2C Memorial section */}
            <div className="mt-5 pt-5 border-t" style={{ borderColor: "#302d28" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "#f0ede8" }}>Vollständige Gedenkseite (B2C)</p>
              <p className="text-xs mb-4" style={{ color: "#8a8278" }}>
                Erstellen Sie eine vollständige Evertrace-Gedenkseite für die Angehörigen — mit Biografie, Fotos, Timeline und mehr. Sie als Bestatter und die Angehörigen können gemeinsam daran arbeiten.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/CreateMemorial?case_id=${caseData.id}&funeral_home_id=${caseData.funeral_home_id || ""}&collab_email=${encodeURIComponent(currentUser?.email || "")}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}
                >
                  <Globe className="w-4 h-4" /> Jetzt erstellen
                </a>
                {caseData.next_of_kin_email && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: "rgba(201,169,110,0.08)", border: "1px solid #302d28", color: "#8a8278" }}>
                    <Users className="w-4 h-4" />
                    <span>Angehörige/r: {caseData.next_of_kin_email}</span>
                    <span className="text-xs" style={{ color: "#5a554e" }}>(wird als Mitbearbeiter eingeladen)</span>
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Right col — Timeline */}
        <div>
          <Section title="Aktivitäten">
            {timeline.length === 0 ? (
              <div className="py-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: "#302d28" }} />
                <p className="text-sm" style={{ color: "#5a554e" }}>Noch keine Aktivitäten.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: t.color }} />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: "#f0ede8" }}>{t.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>{fmtDateTime(t.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      </div>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <button onClick={() => setEditing(false)} className="absolute top-5 right-5" style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Fall bearbeiten</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{ k: "deceased_first_name", label: "Vorname" }, { k: "deceased_last_name", label: "Nachname" }].map(({ k, label }) => (
                  <div key={k}>
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input value={editForm[k] || ""} onChange={e => setF(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ k: "date_of_birth", label: "Geburtsdatum" }, { k: "date_of_death", label: "Sterbedatum" }].map(({ k, label }) => (
                  <div key={k}>
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input type="date" value={editForm[k] || ""} onChange={e => setF(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8", colorScheme: "dark" }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Bestattungsart</label>
                <select value={editForm.burial_type || ""} onChange={e => setF("burial_type", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
                  {BURIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Status</label>
                <select value={editForm.status || ""} onChange={e => setF("status", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: "#302d28" }}>
                <p className="text-xs mb-3" style={{ color: "#8a8278" }}>Angehörige/r</p>
                {[{ k: "next_of_kin_name", label: "Name" }, { k: "next_of_kin_email", label: "E-Mail" }, { k: "next_of_kin_phone", label: "Telefon" }].map(({ k, label }) => (
                  <div key={k} className="mb-3">
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input value={editForm[k] || ""} onChange={e => setF(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Abbrechen</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {saving && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}