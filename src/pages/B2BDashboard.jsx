import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import StatCard from "@/components/b2b/StatCard";
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

const STATUS_COLORS = { aktiv: "#c9a96e", abgeschlossen: "#4ade80", archiviert: "#5a554e" };

export default function B2BDashboard() {
  const [cases, setCases] = useState([]);
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      Promise.all([
        base44.entities.Case.filter({ created_by: u.email }, "-created_date", 20),
        base44.entities.MourningCard.filter({ created_by: u.email }, "-created_date", 50),
        base44.entities.PrintOrder.filter({ created_by: u.email }, "-created_date", 50),
      ]).then(([c, k, o]) => {
        setCases(c); setCards(k); setOrders(o); setLoading(false);
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
            <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: "#181714" }} />
          ))}
        </div>
      </B2BLayout>
    );
  }

  return (
    <B2BLayout
      title="Übersicht"
      subtitle={`${format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}`}
      action={
        <Link to="/B2BCases" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
            Trauerkarten — letzte 6 Monate
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="monat" axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#201e1a", border: "1px solid #302d28", borderRadius: 10, color: "#f0ede8" }}
                cursor={{ fill: "rgba(201,169,110,0.05)" }}
              />
              <Bar dataKey="Karten" fill="#c9a96e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent cases */}
        <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Letzte Fälle</h2>
            <Link to="/B2BCases" className="text-xs flex items-center gap-1 transition-all" style={{ color: "#c9a96e" }}>
              Alle <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {cases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#5a554e" }}>Noch keine Fälle angelegt.</p>
              <Link to="/B2BCases" className="text-sm mt-3 inline-block" style={{ color: "#c9a96e" }}>Ersten Fall anlegen →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 5).map(c => (
                <Link key={c.id} to={`/B2BCaseDetail?id=${c.id}`} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ background: "#201e1a" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>{c.deceased_first_name} {c.deceased_last_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5a554e" }}>† {fmtDate(c.date_of_death)}</p>
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
  );
}