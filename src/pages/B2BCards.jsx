import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Plus, CreditCard, Copy, Image } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const STATUS_COLORS = { entwurf: "#8a8278", bereit: "#c9a96e", bestellt: "#4ade80" };
const MOTIF_LABELS = { floral_classic: "Florales Klassik", minimalist: "Minimalistisch", religious: "Religiös", nature: "Natur", maritime: "Maritime", forest: "Waldmotiv" };
const FORMAT_LABELS = { DIN_A6_landscape: "DIN A6 quer", DIN_lang_portrait: "DIN lang", DIN_A5_folded: "DIN A5 gefaltet", Leporello: "Leporello" };
const ACCENT = "#c9a96e";

export default function B2BCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [cases, setCases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("cards");

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(fh => {
        if (fh.length === 0) { navigate("/B2BRegister"); return; }
        Promise.all([
          base44.entities.MourningCard.filter({ created_by: u.email }, "-created_date", 50),
          base44.entities.Case.filter({ created_by: u.email }, "-created_date", 100),
          base44.entities.CardTemplate.filter({ created_by: u.email }, "-created_date", 50),
        ]).then(([k, c, t]) => { setCards(k); setCases(c); setTemplates(t); setLoading(false); })
          .catch(() => setLoading(false));
      });
    }).catch(() => setLoading(false));
  }, []);

  const getCase = (id) => cases.find(c => c.id === id);

  return (
    <B2BLayout
      title="Trauerkarten"
      subtitle="Erstellte Karten und gespeicherte Vorlagen"
      action={
        <Link to="/B2BCardWizard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: ACCENT, color: "#0f0e0c" }}>
          <Plus className="w-4 h-4" /> Neue Karte
        </Link>
      }
    >
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#181714", border: "1px solid #302d28", width: "fit-content" }}>
        <button onClick={() => setActiveView("cards")}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: activeView === "cards" ? ACCENT : "transparent", color: activeView === "cards" ? "#0f0e0c" : "#5a554e" }}>
          Karten ({cards.length})
        </button>
        <button onClick={() => setActiveView("templates")}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: activeView === "templates" ? ACCENT : "transparent", color: activeView === "templates" ? "#0f0e0c" : "#5a554e" }}>
          Vorlagen ({templates.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}</div>
      ) : activeView === "cards" ? (
        cards.length === 0 ? (
          <div className="rounded-2xl py-24 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: "#302d28" }} />
            <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Noch keine Trauerkarten</p>
            <p className="text-sm mb-6" style={{ color: "#5a554e" }}>Erstellen Sie Ihre erste personalisierte Trauerkarte.</p>
            <Link to="/B2BCardWizard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: ACCENT, color: "#0f0e0c" }}>
              <Plus className="w-4 h-4" /> Erste Karte erstellen
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map(card => {
              const c = getCase(card.case_id);
              return (
                <div key={card.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: "#181714", border: "1px solid #302d28" }}>
                  <div className="flex items-center gap-4">
                    {card.motif_image_url ? (
                      <img src={card.motif_image_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.1)" }}>
                        <CreditCard className="w-5 h-5" style={{ color: ACCENT }} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>
                        {c ? `${c.deceased_first_name} ${c.deceased_last_name}` : "Unbekannter Fall"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>
                        {FORMAT_LABELS[card.format] || card.format} · {MOTIF_LABELS[card.motif_theme] || card.motif_theme} · {fmtDate(card.created_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/B2BCardWizard?draft_id=${card.id}&duplicate=true`)}
                      className="text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:bg-stone-800"
                      style={{ color: "#8a8278", border: "1px solid #302d28" }}>
                      <Copy className="w-3 h-3 inline mr-1" /> Duplizieren
                    </button>
                    {card.status === "entwurf" ? (
                      <Link to={`/B2BCardWizard?draft_id=${card.id}`} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(251,191,36,0.15)", color: "#f59e0b", border: "1px solid rgba(251,191,36,0.3)" }}>
                        Entwurf — fortsetzen →
                      </Link>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${STATUS_COLORS[card.status]}20`, color: STATUS_COLORS[card.status] }}>
                        {card.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Templates view */
        templates.length === 0 ? (
          <div className="rounded-2xl py-20 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <Image className="w-10 h-10 mx-auto mb-3" style={{ color: "#302d28" }} />
            <p className="text-sm mb-1" style={{ color: "#f0ede8" }}>Noch keine Vorlagen gespeichert.</p>
            <p className="text-xs" style={{ color: "#5a554e" }}>Erstellen Sie eine Karte und speichern Sie sie als Vorlage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="rounded-2xl overflow-hidden" style={{ background: "#181714", border: "1px solid #302d28" }}>
                {t.motif_image_url ? (
                  <img src={t.motif_image_url} alt="" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center" style={{ background: "#201e1a" }}>
                    <CreditCard className="w-8 h-8" style={{ color: "#302d28" }} />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-medium mb-1" style={{ color: "#f0ede8" }}>{t.name || "Unbenannte Vorlage"}</p>
                  <p className="text-xs mb-4" style={{ color: "#5a554e" }}>
                    {MOTIF_LABELS[t.motif_theme] || t.motif_theme || "–"} · {FORMAT_LABELS[t.format] || t.format || "–"}
                  </p>
                  <div className="flex gap-2">
                    <Link to={`/B2BCardWizard?template_id=${t.id}`}
                      className="flex-1 py-2 rounded-xl text-xs text-center font-medium"
                      style={{ background: ACCENT, color: "#0f0e0c" }}>
                      Verwenden
                    </Link>
                    <button onClick={async () => {
                      if (!window.confirm(`Vorlage "${t.name}" löschen?`)) return;
                      await base44.entities.CardTemplate.delete(t.id);
                      setTemplates(prev => prev.filter(x => x.id !== t.id));
                    }} className="px-3 py-2 rounded-xl text-xs" style={{ color: "#5a554e", border: "1px solid #302d28" }}>
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </B2BLayout>
  );
}