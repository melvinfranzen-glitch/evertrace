export default function StatCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.1)" }}>
            <Icon className="w-4 h-4" style={{ color: "#c9a96e" }} />
          </div>
        )}
      </div>
      <p className="text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#5a554e" }}>{sub}</p>}
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            background: trend >= 0 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
            color: trend >= 0 ? "#4ade80" : "#f87171"
          }}>
            {trend >= 0 ? "+" : ""}{trend}% ggü. Vormonat
          </span>
        </div>
      )}
    </div>
  );
}