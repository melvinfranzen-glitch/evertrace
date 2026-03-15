import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Globe, BarChart3, Settings, Package, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { path: "/B2BDashboard", icon: LayoutDashboard, label: "Übersicht" },
  { path: "/B2BCases", icon: Users, label: "Fälle" },
  { path: "/B2BCards", icon: CreditCard, label: "Trauerkarten" },
  { path: "/B2BMemorial", icon: Globe, label: "Gedenkseiten" },
  { path: "/B2BOrders", icon: Package, label: "Bestellungen" },
  { path: "/B2BAnalytics", icon: BarChart3, label: "Analysen" },
  { path: "/B2BSettings", icon: Settings, label: "Einstellungen" },
];

export default function B2BSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

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
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
              style={{
                background: active ? "rgba(201,169,110,0.1)" : "transparent",
                color: active ? "#c9a96e" : "#8a8278",
                borderLeft: active ? "2px solid #c9a96e" : "2px solid transparent",
              }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "#302d28" }}>
        <button onClick={() => base44.auth.logout()} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all" style={{ color: "#5a554e" }}>
          <LogOut className="w-4 h-4" /> Abmelden
        </button>
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
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all"
              style={{ color: active ? "#c9a96e" : "#5a554e" }}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}