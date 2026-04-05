import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Plus, CreditCard } from "lucide-react";
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

export default function B2BCards() {
  const [cards, setCards] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1).then(fh => {
        if (fh.length === 0) { window.location.href = "/B2BRegister"; return; }
        Promise.all([
          base44.entities.MourningCard.filter({ created_by: u.email }, "-created_date", 50),
          base44.entities.Case.filter({ created_by: u.email }, "-created_date", 100),
        ]).then(([k, c]) => { setCards(k); setCases(c); setLoading(false); });
      });
    });
  }, []);

  const getCase = (id) => cases.find(c => c.id === id);

  return (
    <B2BLayout
      title="Trauerkarten"
      subtitle="Alle erstellten Trauerkarten"
      action={
        <Link to="/B2BCardWizard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          <Plus className="w-4 h-4" /> Neue Karte
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}</div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl py-24 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: "#302d28" }} />
          <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Noch keine Trauerkarten</p>
          <p className="text-sm mb-6" style={{ color: "#5a554e" }}>Erstellen Sie Ihre erste personalisierte Trauerkarte.</p>
          <Link to="/B2BCardWizard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.1)" }}>
                    <CreditCard className="w-5 h-5" style={{ color: "#c9a96e" }} />
                  </div>
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
      )}
    </B2BLayout>
  );
}