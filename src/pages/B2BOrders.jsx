import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { Package, Filter } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmtDate(d) {
  if (!d) return "—";
  try { return format(new Date(d), "dd.MM.yyyy", { locale: de }); }
  catch { return d; }
}

const STATUS_COLORS = {
  "Entwurf": "#5a554e",
  "In Bearbeitung": "#c9a96e",
  "Im Druck": "#a78bfa",
  "Versendet": "#60a5fa",
  "Zugestellt": "#4ade80",
};

const ALL_STATUSES = ["Alle", "Entwurf", "In Bearbeitung", "Im Druck", "Versendet", "Zugestellt"];

export default function B2BOrders() {
  const [orders, setOrders] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.PrintOrder.list("-created_date", 100),
      base44.entities.Case.list("-created_date", 100),
    ]).then(([o, c]) => { setOrders(o); setCases(c); setLoading(false); });
  }, []);

  const getCase = (id) => cases.find(c => c.id === id);

  const filtered = orders.filter(o => statusFilter === "Alle" || o.status === statusFilter);

  const updateStatus = async (orderId, newStatus) => {
    await base44.entities.PrintOrder.update(orderId, { status: newStatus });
    setOrders(p => p.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selected?.id === orderId) setSelected(s => ({ ...s, status: newStatus }));
  };

  return (
    <B2BLayout title="Bestellungen" subtitle="Print-on-Demand Verwaltung">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: statusFilter === s ? "rgba(201,169,110,0.15)" : "#181714",
              color: statusFilter === s ? "#c9a96e" : "#8a8278",
              border: `1px solid ${statusFilter === s ? "#c9a96e" : "#302d28"}`,
            }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "#181714" }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-24 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: "#302d28" }} />
          <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Keine Bestellungen</p>
          <p className="text-sm" style={{ color: "#5a554e" }}>Bestellungen erscheinen hier nach Abschluss des Karten-Assistenten.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #302d28" }}>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3" style={{ background: "#181714", borderBottom: "1px solid #302d28" }}>
            {["Art", "Fall", "Menge", "Tier", "Betrag", "Datum", "Status", ""].map((h, i) => (
              <div key={i} className={`text-xs font-medium uppercase tracking-wide ${[2,3,4,5].includes(i) ? "col-span-1" : i === 0 ? "col-span-2" : i === 1 ? "col-span-2" : i === 6 ? "col-span-2" : "col-span-1"}`} style={{ color: "#5a554e" }}>{h}</div>
            ))}
          </div>
          {filtered.map((order, i) => {
            const c = getCase(order.case_id);
            const statusColor = STATUS_COLORS[order.status] || "#5a554e";
            return (
              <div key={order.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-b transition-all cursor-pointer"
                style={{ background: selected?.id === order.id ? "rgba(201,169,110,0.04)" : i % 2 === 0 ? "#181714" : "#1a1917", borderColor: "#302d28" }}
                onClick={() => setSelected(selected?.id === order.id ? null : order)}>
                <div className="col-span-2 text-sm" style={{ color: "#f0ede8" }}>{order.order_type}</div>
                <div className="col-span-2 text-sm" style={{ color: "#8a8278" }}>
                  {c ? `${c.deceased_first_name} ${c.deceased_last_name}` : "—"}
                </div>
                <div className="col-span-1 text-sm" style={{ color: "#8a8278" }}>{order.quantity}</div>
                <div className="col-span-1 text-sm capitalize" style={{ color: "#8a8278" }}>{order.print_tier}</div>
                <div className="col-span-1 text-sm font-medium" style={{ color: "#c9a96e" }}>
                  € {order.total_price ? order.total_price.toFixed(2).replace(".", ",") : "—"}
                </div>
                <div className="col-span-1 text-xs" style={{ color: "#5a554e" }}>{fmtDate(order.created_date)}</div>
                <div className="col-span-2">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
                    {order.status}
                  </span>
                </div>
                <div className="col-span-2" />
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-80 z-40 p-6 overflow-y-auto" style={{ background: "#181714", borderLeft: "1px solid #302d28" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Bestelldetails</h3>
            <button onClick={() => setSelected(null)} style={{ color: "#5a554e" }}>✕</button>
          </div>

          <div className="space-y-3 mb-6">
            {[
              ["Art", selected.order_type],
              ["Menge", `${selected.quantity} Stk.`],
              ["Drucktier", selected.print_tier],
              ["Betrag", `€ ${selected.total_price?.toFixed(2).replace(".", ",") || "—"}`],
              ["Datum", fmtDate(selected.created_date)],
              ["Lieferung an", selected.delivery_name || "—"],
              ["Adresse", [selected.delivery_street, `${selected.delivery_zip} ${selected.delivery_city}`].filter(Boolean).join(", ") || "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm border-b py-2" style={{ borderColor: "#302d28" }}>
                <span style={{ color: "#8a8278" }}>{label}</span>
                <span style={{ color: "#f0ede8" }}>{val}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs mb-2" style={{ color: "#8a8278" }}>Status aktualisieren</p>
            <div className="space-y-1.5">
              {ALL_STATUSES.slice(1).map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: selected.status === s ? `${STATUS_COLORS[s]}15` : "transparent",
                    color: selected.status === s ? STATUS_COLORS[s] : "#8a8278",
                    border: `1px solid ${selected.status === s ? STATUS_COLORS[s] : "#302d28"}`,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}