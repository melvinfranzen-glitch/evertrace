import B2BSidebar from "./B2BSidebar";

export default function B2BLayout({ children, title, subtitle, action }) {
  return (
    <div className="min-h-screen" style={{ background: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
      <B2BSidebar />
      {/* md = tablet (768px+), sidebar is 224px wide */}
      <div className="md:ml-56 pb-20 md:pb-0 min-h-screen">
        {/* Page header */}
        <div className="px-4 sm:px-6 lg:px-10 pt-6 md:pt-8 pb-5 border-b flex items-start justify-between gap-3 flex-wrap" style={{ borderColor: "#302d28" }}>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold truncate" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{title}</h1>
            {subtitle && <p className="text-xs md:text-sm mt-0.5" style={{ color: "#8a8278" }}>{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-10 py-5 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}