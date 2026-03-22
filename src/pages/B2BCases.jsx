import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Plus, Search, ChevronDown, CreditCard, Globe, Package, Trash2, X } from "lucide-react";
import DateInput from "@/components/ui/DateInput";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const BURIAL_TYPES = ["Erdbestattung", "Feuerbestattung", "Seebestattung", "Waldbestattung", "Urnenbeisetzung"];
const STATUS_OPTS = ["aktiv", "abgeschlossen", "archiviert"];
const STATUS_COLORS = { aktiv: "#c9a96e", abgeschlossen: "#4ade80", archiviert: "#5a554e" };

const EMPTY_FORM = {
  deceased_first_name: "", deceased_last_name: "",
  date_of_birth: "", date_of_death: "",
  burial_type: "Erdbestattung",
  next_of_kin_name: "", next_of_kin_email: "", next_of_kin_phone: "",
  status: "aktiv",
};

export default function B2BCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortField, setSortField] = useState("created_date");
  const [sortDir, setSortDir] = useState(-1);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(fh => {
        if (fh.length === 0) { window.location.href = "/B2BRegister"; return; }
        base44.entities.Case.filter({ created_by: u.email }, "-created_date", 100).then(d => { setCases(d); setLoading(false); });
      });
    });
  }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.deceased_first_name.trim()) e.deceased_first_name = "Vorname erforderlich";
    if (!form.deceased_last_name.trim()) e.deceased_last_name = "Nachname erforderlich";
    if (!form.date_of_death) e.date_of_death = "Sterbedatum erforderlich";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const newCase = await base44.entities.Case.create(form);
    setCases(p => [newCase, ...p]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const confirmDelete = async () => {
    await base44.entities.Case.delete(deleteId);
    setCases(p => p.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d * -1);
    else { setSortField(field); setSortDir(-1); }
  };

  const filtered = cases
    .filter(c => {
      const name = `${c.deceased_first_name} ${c.deceased_last_name}`.toLowerCase();
      return name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const va = a[sortField] || "";
      const vb = b[sortField] || "";
      return va < vb ? sortDir : -sortDir;
    });

  const SortBtn = ({ field, label }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide"
      style={{ color: sortField === field ? "#c9a96e" : "#5a554e" }}>
      {label} {sortField === field && <ChevronDown className="w-3 h-3" style={{ transform: sortDir === -1 ? "rotate(180deg)" : "" }} />}
    </button>
  );

  return (
    <B2BLayout
      title="Fallverwaltung"
      subtitle="Alle Bestattungsfälle auf einen Blick"
      action={
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          <Plus className="w-4 h-4" /> Neuer Fall
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5a554e" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Verstorbene/r suchen…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "#181714", border: "1px solid #302d28", color: "#f0ede8" }} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #302d28" }}>
        {/* Header — desktop only */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3" style={{ background: "#181714", borderBottom: "1px solid #302d28" }}>
          <div className="col-span-3"><SortBtn field="deceased_last_name" label="Name" /></div>
          <div className="col-span-2"><SortBtn field="date_of_death" label="Todesdatum" /></div>
          <div className="col-span-2 text-xs font-medium uppercase tracking-wide" style={{ color: "#5a554e" }}>Bestattungsart</div>
          <div className="col-span-2 text-xs font-medium uppercase tracking-wide" style={{ color: "#5a554e" }}>Dienste</div>
          <div className="col-span-2"><SortBtn field="status" label="Status" /></div>
          <div className="col-span-1" />
        </div>

        {loading ? (
          <div>{[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse border-b" style={{ background: "#181714", borderColor: "#302d28" }} />
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center" style={{ background: "#181714" }}>
            <p className="text-sm mb-3" style={{ color: "#5a554e" }}>Keine Fälle gefunden.</p>
            <button onClick={() => setShowModal(true)} className="text-sm" style={{ color: "#c9a96e" }}>Ersten Fall anlegen →</button>
          </div>
        ) : (
          filtered.map((c, i) => (
            <div key={c.id}>
              {/* Desktop row (md+) */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 items-center transition-all border-b"
                style={{ background: i % 2 === 0 ? "#181714" : "#1a1917", borderColor: "#302d28" }}>
                <div className="col-span-3">
                  <Link to={`/B2BCaseDetail?id=${c.id}`} className="font-medium text-sm hover:underline" style={{ color: "#f0ede8" }}>
                    {c.deceased_first_name} {c.deceased_last_name}
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>* {fmtDate(c.date_of_birth)}</p>
                </div>
                <div className="col-span-2 text-sm" style={{ color: "#8a8278" }}>{fmtDate(c.date_of_death)}</div>
                <div className="col-span-2 text-sm" style={{ color: "#8a8278" }}>{c.burial_type || "—"}</div>
                <div className="col-span-2 flex gap-2">
                  {c.has_card && <span title="Trauerkarte"><CreditCard className="w-4 h-4" style={{ color: "#c9a96e" }} /></span>}
                  {c.has_memorial && <span title="Gedenkseite"><Globe className="w-4 h-4" style={{ color: "#4ade80" }} /></span>}
                  {c.has_order && <span title="Bestellung"><Package className="w-4 h-4" style={{ color: "#60a5fa" }} /></span>}
                </div>
                <div className="col-span-2">
                  <select value={c.status} onChange={async e => { await base44.entities.Case.update(c.id, { status: e.target.value }); setCases(p => p.map(x => x.id === c.id ? { ...x, status: e.target.value } : x)); }}
                    style={{ background: "transparent", border: "none", color: STATUS_COLORS[c.status], fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    {STATUS_OPTS.map(s => <option key={s} value={s} style={{ color: "#f0ede8", background: "#201e1a" }}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg transition-all" style={{ color: "#5a554e" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile card (below md) */}
              <div className="md:hidden p-4 border-b" style={{ background: i % 2 === 0 ? "#181714" : "#1a1917", borderColor: "#302d28" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={`/B2BCaseDetail?id=${c.id}`} className="font-semibold text-base hover:underline leading-tight" style={{ color: "#f0ede8", fontFamily: "'Cormorant Garamond', serif" }}>
                    {c.deceased_first_name} {c.deceased_last_name}
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={c.status} onChange={async e => { await base44.entities.Case.update(c.id, { status: e.target.value }); setCases(p => p.map(x => x.id === c.id ? { ...x, status: e.target.value } : x)); }}
                      style={{ background: "transparent", border: "none", color: STATUS_COLORS[c.status], fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      {STATUS_OPTS.map(s => <option key={s} value={s} style={{ color: "#f0ede8", background: "#201e1a" }}>{s}</option>)}
                    </select>
                    <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg" style={{ color: "#5a554e" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs mb-2" style={{ color: "#8a8278" }}>
                  {c.date_of_death && <span>† {fmtDate(c.date_of_death)}</span>}
                  {c.burial_type && <span>{c.burial_type}</span>}
                </div>
                <div className="flex gap-2">
                  {c.has_card && <span title="Trauerkarte"><CreditCard className="w-4 h-4" style={{ color: "#c9a96e" }} /></span>}
                  {c.has_memorial && <span title="Gedenkseite"><Globe className="w-4 h-4" style={{ color: "#4ade80" }} /></span>}
                  {c.has_order && <span title="Bestellung"><Package className="w-4 h-4" style={{ color: "#60a5fa" }} /></span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New case modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5" style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Neuen Fall anlegen</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: "deceased_first_name", label: "Vorname" },
                  { k: "deceased_last_name", label: "Nachname" },
                ].map(({ k, label }) => (
                  <div key={k}>
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: `1px solid ${errors[k] ? "#e57373" : "#302d28"}`, color: "#f0ede8" }} />
                    {errors[k] && <p className="text-xs mt-1" style={{ color: "#e57373" }}>{errors[k]}</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: "date_of_birth", label: "Geburtsdatum" },
                  { k: "date_of_death", label: "Sterbedatum" },
                ].map(({ k, label }) => (
                  <div key={k}>
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input type="date" value={form[k]} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: `1px solid ${errors[k] ? "#e57373" : "#302d28"}`, color: "#f0ede8" }} />
                    {errors[k] && <p className="text-xs mt-1" style={{ color: "#e57373" }}>{errors[k]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>Bestattungsart</label>
                <select value={form.burial_type} onChange={e => set("burial_type", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
                  {BURIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: "#302d28" }}>
                <p className="text-xs mb-3" style={{ color: "#8a8278" }}>Angehörige/r</p>
                {[
                  { k: "next_of_kin_name", label: "Name" },
                  { k: "next_of_kin_email", label: "E-Mail" },
                  { k: "next_of_kin_phone", label: "Telefon" },
                ].map(({ k, label }) => (
                  <div key={k} className="mb-3">
                    <label className="text-xs mb-1.5 block" style={{ color: "#8a8278" }}>{label}</label>
                    <input value={form[k]} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Abbrechen</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {saving && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                Fall anlegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Fall löschen?</h3>
            <p className="text-sm mb-6" style={{ color: "#8a8278" }}>Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm border" style={{ borderColor: "#302d28", color: "#8a8278" }}>Abbrechen</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#e57373", color: "white" }}>Löschen</button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}