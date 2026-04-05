import { LayoutDashboard, Users, CreditCard, Globe, BarChart3, Settings, Package, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { useB2BBranding } from "@/contexts/B2BBrandingContext";

export default function B2BSidebar() {
  const location = useLocation();
  const [badges, setBadges] = useState({ orders: 0, memorials: 0, cases: 0 });
  const { branding } = useB2BBranding() || {};
  const accent = branding?.accent_color || "#c9a96e";

  useEffect(() => {
    base44.auth.me().then(async u => {
      const [orders, cases, contributions] = await Promise.all([
        base44.entities.PrintOrder.filter({ created_by: u.email, status: "In Bearbeitung" }, "-created_date", 50),
        base44.entities.Case.filter({ created_by: u.email, status: "aktiv" }, "-created_date", 100),
        base44.entities.B2BContribution.list("-created_date", 100),
      ]);
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const recentContribs = contributions.filter(c => new Date(c.created_date) > cutoff).length;
      setBadges({ orders: orders.length, cases: cases.length, memorials: recentContribs });
    }).catch(() => {});
  }, []);

  const NAV = [
    { path: "/B2BDashboard", icon: LayoutDashboard, label: "Übersicht" },
    { path: "/B2BCases", icon: Users, label: "Fälle", badge: badges.cases },
    { path: "/B2BCards", icon: CreditCard, label: "Trauerkarten" },
    { path: "/B2BMemorial", icon: Globe, label: "Gedenkseiten", badge: badges.memorials, badgeGold: true },
    { path: "/B2BOrders", icon: Package, label: "Bestellungen", badge: badges.orders, badgeRed: true },
    { path: "/B2BAnalytics", icon: BarChart3, label: "Analysen" },
    { path: "/B2BSettings", icon: Settings, label: "Einstellungen" },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label, badge, badgeRed, badgeGold }) => {
    const active = isActive(path);
    return (
      <Link key={path} to={path}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative"
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: active ? 400 : 300,
          background: active ? `${accent}1A` : "transparent",
          color: active ? accent : "rgba(216,195,165,0.5)",
          borderLeft: active ? `2px solid ${accent}` : "2px solid transparent",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(216,195,165,0.04)"; e.currentTarget.style.color = "#D8C3A5"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(216,195,165,0.5)"; } }}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
        {badge > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center"
            style={{
              background: badgeRed ? "#ef4444" : badgeGold ? `${accent}33` : `${accent}26`,
              color: badgeRed ? "white" : accent,
            }}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const [loggingOut, setLoggingOut] = useState(false);

  const LogoutButton = () => (
    <button
      onClick={async () => {
        setLoggingOut(true);
        await base44.auth.logout();
      }}
      disabled={loggingOut}
      className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all"
      style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
    >
      {loggingOut ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        <LogOut className="w-4 h-4 flex-shrink-0" />
      )}
      {loggingOut ? "Abmelden…" : "Abmelden"}
    </button>
  );

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(216,195,165,0.08)" }}>
        {branding?.logo_url ? (
          <div className="flex items-center gap-2.5">
            <img src={branding.logo_url} alt="" className="h-7 object-contain" style={{ maxWidth: 120 }} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent }}>
              <span className="text-xs font-bold" style={{ color: "#0f0e0c" }}>
                {(branding?.name || "E").charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
                {branding?.name || "Evertrace"}
              </p>
              {branding?.tagline && <p className="text-xs" style={{ color: "#5a554e" }}>{branding.tagline}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => <NavItem key={item.path} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(216,195,165,0.08)" }}>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar — visible on md+ */}
      <div className="hidden md:flex flex-col w-56 min-h-screen fixed left-0 top-0 bottom-0 z-30" style={{ background: "#231E1A", borderRight: "1px solid rgba(216,195,165,0.08)" }}>
        <SidebarContent />
      </div>

      {/* Mobile/Tablet bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 border-t"
        style={{ background: "#231E1A", borderColor: "rgba(216,195,165,0.08)", paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))", paddingTop: "0.5rem" }}>
        {NAV.map(({ path, icon: Icon, label, badge, badgeRed }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all relative min-w-[44px] min-h-[44px] justify-center"
              style={{ color: active ? accent : "rgba(216,195,165,0.4)" }}>
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                    style={{ background: badgeRed ? "#ef4444" : accent, color: "white" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}