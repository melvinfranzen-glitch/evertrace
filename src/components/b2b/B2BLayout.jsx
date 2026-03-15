import B2BSidebar from "./B2BSidebar";

export default function B2BLayout({ children, title, subtitle, action }) {
  return (
    <div className="min-h-screen" style={{ background: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
      <B2BSidebar />
      <div className="md:ml-56 pb-24 md:pb-0">
        {/* Page header */}
        <div className="px-6 md:px-10 pt-8 pb-6 border-b flex items-start justify-between gap-4" style={{ borderColor: "#302d28" }}>
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{title}</h1>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: "#8a8278" }}>{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        {/* Content */}
        <div className="px-6 md:px-10 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}