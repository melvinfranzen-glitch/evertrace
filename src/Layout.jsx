import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Heart, Menu, X, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMemorialPage = currentPageName === "MemorialProfile";

  if (isMemorialPage) return <>{children}</>;

  const navLinks = [
    { label: "Startseite", page: "Home" },
    { label: "Dashboard", page: "Dashboard", auth: true },
    { label: "Shop", page: "Shop" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAF8" }}>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/96 backdrop-blur-sm shadow-sm border-b border-stone-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#92400e,#b45309)" }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-wide text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Evertrace
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`text-sm font-medium transition-colors ${
                      currentPageName === link.page ? "text-amber-700" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link to={createPageUrl("AdminDashboard")} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.full_name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()} className="text-gray-600">
                  Anmelden
                </Button>
                <Button
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="text-white"
                  style={{ background: "#b45309" }}
                >
                  Kostenlos starten
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-3 shadow-lg">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link key={link.page} to={createPageUrl(link.page)} className="block text-gray-700 py-2 text-sm" onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link to={createPageUrl("AdminDashboard")} className="block text-gray-700 py-2 text-sm" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            {!user && (
              <Button
                className="w-full text-white"
                style={{ background: "#b45309" }}
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              >
                Kostenlos starten
              </Button>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer style={{ background: "#1c1917" }} className="text-stone-400 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#b45309" }}>
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Evertrace</span>
            </div>
            <p className="text-sm text-center">Erinnern. Erzählen. Bewahren. — Digitale Gedenkkultur mit Würde.</p>
            <p className="text-sm">© 2026 Evertrace · DSGVO-konform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}