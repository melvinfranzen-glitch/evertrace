import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import StatCard from "@/components/b2b/StatCard";
import { Users, CreditCard, Globe, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const GOLD = "#c9a96e";
const COLORS = ["#c9a96e", "#4ade80", "#60a5fa", "#a78bfa", "#f87171", "#fb923c"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function B2BAnalytics() {
  const [cases, setCases] = useState([]);
  const [cards, setCards] = useState([]);
  const [pages, setPages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      Promise.all([
        base44.entities.Case.filter({ created_by: u.email }, "-created_date", 200),
        base44.entities.MourningCard.filter({ created_by: u.email }, "-created_date", 200),
        base44.entities.B2BMemorialPage.filter({ created_by: u.email }, "-created_date", 200),
        base44.entities.PrintOrder.filter({ created_by: u.email }, "-created_date", 200),
      ]).then(([c, k, p, o]) => { setCases(c); setCards(k); setPages(p); setOrders(o); setLoading(false); });
    });
  }, []);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = (arr) => arr.filter(x => new Date(x.created_date) >= thisMonthStart).length;
  const lastMonth = (arr) => arr.filter(x => {
    const d = new Date(x.created_date);
    return d >= lastMonthStart && d <= lastMonthEnd;
  }).length;

  const pctChange = (cur, prev) => prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100);

  // Monthly bar chart — 12 months
  const monthlyCards = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const count = cards.filter(card => {
      const d = new Date(card.created_date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    return { monat: MONTHS[m.getMonth()], Karten: count };
  });

  const monthlyCases = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const count = cases.filter(c => {
      const d = new Date(c.created_date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    return { monat: MONTHS[m.getMonth()], Fälle: count };
  });

  const revThisMonth = orders.filter(o => new Date(o.created_date) >= thisMonthStart)
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  // Feature usage
  const featureData = [
    { name: "Trauerkarten", value: cards.length },
    { name: "Gedenkseiten", value: pages.length },
    { name: "QR-Codes", value: cards.filter(k => k.addon_qr).length },
    { name: "Einladungskarten", value: cards.filter(k => k.addon_invitation).length },
    { name: "Danksagungen", value: cards.filter(k => k.addon_thankyou).length },
  ].filter(f => f.value > 0);

  if (loading) {
    return <B2BLayout title="Analysen"><div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}</div></B2BLayout>;
  }

  return (
    <B2BLayout title="Analysen" subtitle="Nutzungsstatistiken und Übersichten">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Neue Fälle (diesen Monat)" value={thisMonth(cases)} icon={Users} trend={pctChange(thisMonth(cases), lastMonth(cases))} />
        <StatCard label="Karten (diesen Monat)" value={thisMonth(cards)} icon={CreditCard} trend={pctChange(thisMonth(cards), lastMonth(cards))} />
        <StatCard label="Aktive Gedenkseiten" value={pages.length} icon={Globe} sub="insgesamt" />
        <StatCard label="Umsatz (diesen Monat)" value={`€ ${revThisMonth.toFixed(2).replace(".", ",")}`} icon={TrendingUp} sub="aus Druckbestellungen" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Trauerkarten — 12 Monate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCards} barSize={18}>
              <XAxis dataKey="monat" axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(201,169,110,0.05)" }} />
              <Bar dataKey="Karten" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Fälle — 12 Monate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyCases}>
              <XAxis dataKey="monat" axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a554e", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Fälle" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, strokeWidth: 0, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Funktionsnutzung</h2>
          {featureData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <BarChart3 className="w-8 h-8 mb-3" style={{ color: "#302d28" }} />
              <p className="text-sm" style={{ color: "#5a554e" }}>Noch keine Nutzungsdaten vorhanden.</p>
            </div>
          ) : (
            <div className="flex gap-6 items-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={featureData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {featureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {featureData.map((f, i) => (
                  <div key={f.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: "#8a8278" }}>{f.name}</span>
                    </div>
                    <span style={{ color: "#f0ede8" }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Drucktier-Verteilung</h2>
          <div className="space-y-3">
            {["standard", "premium", "express"].map((tier) => {
              const count = orders.filter(o => o.print_tier === tier).length;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              const colors = { standard: "#60a5fa", premium: "#c9a96e", express: "#4ade80" };
              const labels = { standard: "Standard", premium: "Premium", express: "Express" };
              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: "#8a8278" }}>{labels[tier]}</span>
                    <span style={{ color: "#f0ede8" }}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "#302d28" }}>
                    <div className="h-2 rounded-full transition-all" style={{ background: colors[tier], width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </B2BLayout>
  );
}