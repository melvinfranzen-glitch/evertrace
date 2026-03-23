export default function StatCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(216,195,165,0.04)", border: "1px solid rgba(216,195,165,0.1)" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(216,195,165,0.4)", fontFamily: "'Lato', sans-serif", letterSpacing: "0.1em" }}>{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(176,123,52,0.1)" }}>
            <Icon className="w-4 h-4" style={{ color: "#B07B34" }} />
          </div>
        )}
      </div>
      <p className="text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: "#D8C3A5" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(216,195,165,0.4)", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{sub}</p>}
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            background: trend >= 0 ? "rgba(106,154,106,0.12)" : "rgba(176,96,96,0.12)",
            color: trend >= 0 ? "#6A9A6A" : "#B06060",
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
          }}>
            {trend >= 0 ? "+" : ""}{trend}% ggü. Vormonat
          </span>
        </div>
      )}
    </div>
  );
}