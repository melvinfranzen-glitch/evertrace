// Reusable upgrade prompt shown when B2B Free plan limits are reached
export default function UpgradePrompt({ message }) {
  return (
    <div className="rounded-2xl p-8 text-center w-full"
      style={{ background: "#181714", border: "1px solid rgba(201,169,110,0.3)" }}>
      <p className="text-lg font-semibold mb-2"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e" }}>
        {message || "Sie haben das monatliche Limit Ihres Tarifs erreicht."}
      </p>
      <p className="text-sm mb-6" style={{ color: "#8a8278" }}>
        Upgraden Sie auf Starter oder Premium, um ohne Unterbrechung fortzufahren.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/B2BSettings?tab=plan"
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#181714", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.4)" }}>
          Starter – € 39 / Monat
        </a>
        <a href="/B2BSettings?tab=plan"
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          Premium – € 99 / Monat
        </a>
      </div>
    </div>
  );
}