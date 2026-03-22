import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Globe, BarChart3, Settings, Package, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function B2BSidebar() {
  const location = useLocation();
  const [badges, setBadges] = useState({ orders: 0, memorials: 0, cases: 0 });

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
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
        style={{
          background: active ? "rgba(201,169,110,0.1)" : "transparent",
          color: active ? "#c9a96e" : "#8a8278",
          borderLeft: active ? "2px solid #c9a96e" : "2px solid transparent",
        }}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
        {badge > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center"
            style={{
              background: badgeRed ? "#ef4444" : badgeGold ? "rgba(201,169,110,0.2)" : "rgba(201,169,110,0.15)",
              color: badgeRed ? "white" : "#c9a96e",
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
        window.location.href = "/";
      }}
      disabled={loggingOut}
      className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all"
      style={{ color: "#5a554e" }}
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
      <div className="px-5 py-6 border-b" style={{ borderColor: "#302d28" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#c9a96e" }}>
            <span style={{ color: "#0f0e0c", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14 }}>E</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8", fontSize: 18, fontWeight: 600 }}>Evertrace</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => <NavItem key={item.path} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "#302d28" }}>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar — visible on md+ */}
      <div className="hidden md:flex flex-col w-56 min-h-screen fixed left-0 top-0 bottom-0 z-30" style={{ background: "#181714", borderRight: "1px solid #302d28" }}>
        <SidebarContent />
      </div>

      {/* Mobile/Tablet bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 py-2 border-t safe-area-bottom" style={{ background: "#181714", borderColor: "#302d28" }}>
        {NAV.map(({ path, icon: Icon, label, badge, badgeRed }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all relative"
              style={{ color: active ? "#c9a96e" : "#5a554e" }}>
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                    style={{ background: badgeRed ? "#ef4444" : "#c9a96e", color: badgeRed ? "white" : "#0f0e0c" }}>
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