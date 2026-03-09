import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Heart, Menu, X, Shield, LogOut, User } from "lucide-react";
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

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [currentPageName]);

  const isMemorialPage = currentPageName === "MemorialProfile";
  if (isMemorialPage) return <>{children}</>;

  const navLinks = [
    { label: "Startseite", page: "Home" },
    { label: "Dashboard", page: "Dashboard", auth: true },
    { label: "Shop", page: "Shop" },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAF8" }}>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg,#92400e,#b45309)" }}
            >
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg sm:text-xl font-semibold tracking-wide text-gray-800"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Evertrace
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(link.page)
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-stone-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link
                to={createPageUrl("AdminDashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isActive("AdminDashboard")
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-stone-100"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-sm text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="max-w-[140px] truncate">{user.full_name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => base44.auth.logout()}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 h-9 w-9"
                  title="Abmelden"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Anmelden
                </Button>
                <Button
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="text-white shadow-sm"
                  style={{ background: "#b45309" }}
                >
                  Kostenlos starten
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-stone-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)" }}
        >
          <div className="px-4 pt-2 pb-5 border-t border-stone-100 space-y-1">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.page)
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-700 hover:bg-stone-100"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link
                to={createPageUrl("AdminDashboard")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-stone-100"
                onClick={() => setMenuOpen(false)}
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}

            <div className="pt-2 border-t border-stone-100 mt-2 space-y-2">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{user.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => base44.auth.logout()}
                    className="text-red-500 hover:bg-red-50 gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Abmelden
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setMenuOpen(false); base44.auth.redirectToLogin(); }}
                  >
                    Anmelden
                  </Button>
                  <Button
                    className="w-full text-white"
                    style={{ background: "#b45309" }}
                    onClick={() => { setMenuOpen(false); base44.auth.redirectToLogin(createPageUrl("Dashboard")); }}
                  >
                    Kostenlos starten
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer style={{ background: "#1c1917" }} className="text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#b45309" }}>
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Evertrace</span>
            </Link>
            <p className="text-sm">Erinnern. Erzählen. Bewahren. — Digitale Gedenkkultur mit Würde.</p>
            <p className="text-sm shrink-0">© 2026 Evertrace · DSGVO-konform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}