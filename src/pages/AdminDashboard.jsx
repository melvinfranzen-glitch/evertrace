import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Check, X, Eye, Loader2, Shield, Package, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function formatDate(d) {
  try { return format(new Date(d), "d. MMM yyyy", { locale: de }); }
  catch { return d || "–"; }
}

const orderStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const orderStatusLabels = {
  pending: "Ausstehend", processing: "In Bearbeitung", shipped: "Versandt",
  delivered: "Zugestellt", cancelled: "Storniert",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("condolences");
  const [condolences, setCondolences] = useState([]);
  const [memorials, setMemorials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u || u.role !== "admin") { navigate(createPageUrl("Home")); return; }
      setUser(u);
      const [c, m, o] = await Promise.all([
        base44.entities.CondolenceEntry.list("-created_date", 100),
        base44.entities.Memorial.list("-created_date", 100),
        base44.entities.Order.list("-created_date", 100),
      ]);
      setCondolences(c);
      setMemorials(m);
      setOrders(o);
      setLoading(false);
    };
    init();
  }, []);

  const approveCondolence = async (id) => {
    await base44.entities.CondolenceEntry.update(id, { status: "approved" });
    setCondolences((p) => p.map((c) => (c.id === id ? { ...c, status: "approved" } : c)));
  };

  const rejectCondolence = async (id) => {
    await base44.entities.CondolenceEntry.update(id, { status: "rejected" });
    setCondolences((p) => p.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)));
  };

  const updateOrderStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-amber-700" /></div>;
  }

  const pending = condolences.filter((c) => c.status === "pending");

  const tabs = [
    { id: "condolences", label: "Kondolenzen", icon: BookOpen, count: pending.length },
    { id: "memorials", label: "Gedenkseiten", icon: Users, count: memorials.length },
    { id: "orders", label: "Bestellungen", icon: Package, count: orders.filter((o) => o.status === "pending").length },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin-Dashboard</h1>
            <p className="text-gray-500 text-sm">Verwaltung & Moderation</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center">
            <p className="text-3xl font-bold text-gray-800">{memorials.length}</p>
            <p className="text-sm text-gray-500 mt-1">Gedenkseiten</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center">
            <p className="text-3xl font-bold text-amber-700">{pending.length}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Kondolenzen</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-200 text-center">
            <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
            <p className="text-sm text-gray-500 mt-1">Bestellungen</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "#c9a96e" : "white",
                color: tab === t.id ? "white" : "#6b7280",
                border: `1px solid ${tab === t.id ? "#c9a96e" : "#e5e7eb"}`,
              }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className="rounded-full text-xs px-1.5 py-0.5" style={{ background: tab === t.id ? "rgba(255,255,255,0.3)" : "#fef3c7", color: tab === t.id ? "white" : "#c9a96e" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Condolences tab */}
        {tab === "condolences" && (
          <div className="space-y-3">
            {condolences.length === 0 && <p className="text-center text-gray-400 py-10">Keine Kondolenz-Einträge vorhanden.</p>}
            {condolences.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800">{c.author_name}</p>
                      <Badge className={`text-xs ${c.status === "pending" ? "bg-yellow-100 text-yellow-700" : c.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {c.status === "pending" ? "Ausstehend" : c.status === "approved" ? "Freigegeben" : "Abgelehnt"}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatDate(c.created_date)}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{c.message}</p>
                    <p className="text-xs text-gray-400 mt-1">Memorial-ID: {c.memorial_id}</p>
                  </div>
                  {c.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => approveCondolence(c.id)} className="rounded-lg bg-green-600 hover:bg-green-700 text-white h-8">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectCondolence(c.id)} className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 h-8">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Memorials tab */}
        {tab === "memorials" && (
          <div className="space-y-3">
            {memorials.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4">
                {m.hero_image_url ? (
                  <img src={m.hero_image_url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt={m.name} />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold text-stone-400" style={{ background: "#f5f0e8" }}>
                    {m.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.created_by} · {formatDate(m.created_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${m.status === "active" ? "bg-green-100 text-green-700" : m.status === "expired" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                    {m.status === "active" ? "Aktiv" : m.status === "expired" ? "Abgelaufen" : "Entwurf"}
                  </Badge>
                  <Badge className="text-xs bg-stone-100 text-stone-600">{m.plan}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => window.open(`/MemorialProfile?id=${m.short_id}`, "_blank")} className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-center text-gray-400 py-10">Noch keine Bestellungen.</p>}
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800">{o.customer_name}</p>
                      <Badge className={`text-xs ${orderStatusColors[o.status]}`}>{orderStatusLabels[o.status]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{o.product_type?.replace("plaque_", "Plakette ").replace("print_book", "Kondolenzbuch")} · € {o.price}</p>
                    <p className="text-xs text-gray-400 mt-1">{o.shipping_street}, {o.shipping_zip} {o.shipping_city} · {o.customer_email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="text-sm rounded-lg border border-stone-200 px-2 py-1 bg-white text-gray-700"
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="processing">In Bearbeitung</option>
                      <option value="shipped">Versandt</option>
                      <option value="delivered">Zugestellt</option>
                      <option value="cancelled">Storniert</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}