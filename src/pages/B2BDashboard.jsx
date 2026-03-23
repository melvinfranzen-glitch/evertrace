import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import StatCard from "@/components/b2b/StatCard";
import AnniversaryReminders from "@/components/dashboard/AnniversaryReminders";
import OnboardingFlow from "@/components/b2b/OnboardingFlow";
import { Users, CreditCard, Globe, Package, ArrowRight, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const STATUS_COLORS = { aktiv: "#B07B34", abgeschlossen: "#6A9A6A", archiviert: "#6B6257" };

export default function B2BDashboard() {
  const [cases, setCases] = useState([]);
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [funeralHome, setFuneralHome] = useState(null);
  const [loading, setLoading] = useState(true);
  // AnniversaryReminders expects Memorial-like objects with birth_date, death_date, name
  const caseAsMemorials = cases.map(c => ({
    id: c.id,
    name: `${c.deceased_first_name} ${c.deceased_last_name}`,
    birth_date: c.date_of_birth,
    death_date: c.date_of_death,
  }));

  useEffect(() => {
    base44.auth.me().then(u => {
      Promise.all([
        base44.entities.Case.filter({ created_by: u.email }, "-created_date", 100),
        base44.entities.MourningCard.filter({ created_by: u.email }, "-created_date", 50),
        base44.entities.PrintOrder.filter({ created_by: u.email }, "-created_date", 50),
        base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1),
      ]).then(([c, k, o, fh]) => {
        // Fix 1: B2B Route Protection — redirect unregistered users
        if (fh.length === 0) {
          window.location.href = "/B2BRegister";
          return;
        }
        setCases(c); setCards(k); setOrders(o); setFuneralHome(fh[0]); setLoading(false);
      });
    });
  }, []);

  // Chart data — last 6 months
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = cards.filter(card => {
      const d = new Date(card.created_date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    return { monat: MONTHS[m.getMonth()], Karten: count };
  });

  const activeMemorials = cases.filter(c => c.has_memorial).length;
  const pendingOrders = orders.filter(o => o.status === "In Bearbeitung" || o.status === "Im Druck").length;

  if (loading) {
    return (
      <B2BLayout title="Übersicht">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: "rgba(216,195,165,0.06)" }} />
          ))}
        </div>
      </B2BLayout>
    );
  }

  const showOnboarding = funeralHome && funeralHome.onboarding_completed === false;

  return (
    <>
    {showOnboarding && <OnboardingFlow funeralHome={funeralHome} onComplete={() => setFuneralHome(p => ({ ...p, onboarding_completed: true }))} />}
    <B2BLayout
      title="Übersicht"
      subtitle={`${format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}`}
      action={
        <Link to="/B2BCases" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
          <Plus className="w-4 h-4" /> Neuer Fall
        </Link>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Aktive Fälle" value={cases.filter(c => c.status === "aktiv").length} icon={Users} sub={`${cases.length} insgesamt`} />
        <StatCard label="Trauerkarten" value={cards.length} icon={CreditCard} sub="diesen Monat" trend={12} />
        <StatCard label="Gedenkseiten" value={activeMemorials} icon={Globe} sub="aktiv & öffentlich" />
        <StatCard label="Offene Bestellungen" value={pendingOrders} icon={Package} sub="in Bearbeitung" />
      </div>

      {/* Anniversary reminders */}
      {caseAsMemorials.length > 0 && <AnniversaryReminders memorials={caseAsMemorials} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: "rgba(216,195,165,0.04)", border: "1px solid rgba(216,195,165,0.1)" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#D8C3A5" }}>
            Trauerkarten — letzte 6 Monate
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="monat" axisLine={false} tickLine={false} tick={{ fill: "#6B6257", fontSize: 12 }} />
               <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B6257", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#2A2520", border: "1px solid #3A332C", borderRadius: 10, color: "#F7F3ED" }}
                cursor={{ fill: "rgba(176,123,52,0.05)" }}
              />
              <Bar dataKey="Karten" fill="#B07B34" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent cases */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(216,195,165,0.04)", border: "1px solid rgba(216,195,165,0.1)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#D8C3A5" }}>Letzte Fälle</h2>
            <Link to="/B2BCases" className="text-xs flex items-center gap-1 transition-all" style={{ color: "#B07B34" }}>
              Alle <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {cases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Noch keine Fälle angelegt.</p>
              <Link to="/B2BCases" className="text-sm mt-3 inline-block" style={{ color: "#B07B34" }}>Ersten Fall anlegen →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 5).map(c => (
                <Link key={c.id} to={`/B2BCaseDetail?id=${c.id}`} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ background: "rgba(216,195,165,0.03)", border: "1px solid rgba(216,195,165,0.07)" }}>
                  <div>
                    <p className="text-sm" style={{ color: "#D8C3A5", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>{c.deceased_first_name} {c.deceased_last_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(216,195,165,0.4)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>† {fmtDate(c.date_of_death)}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[c.status]}20`, color: STATUS_COLORS[c.status] }}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </B2BLayout>
    </>
  );
}