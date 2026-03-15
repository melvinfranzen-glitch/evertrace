import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X, Shield, LogOut } from "lucide-react";
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

  useEffect(() => { setMenuOpen(false); }, [currentPageName]);

  const isMemorialPage = currentPageName === "MemorialProfile";
  const isHomePage = currentPageName === "Home";
  if (isMemorialPage) return <>{children}</>;
  if (isHomePage) return <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAF8" }}><main className="flex-1">{children}</main></div>;

  const navLinks = [
    { label: "Gedenkseiten", page: "Dashboard", href: "/Dashboard?tab=memorials", auth: true },
    { label: "Trauerkarten", page: "Dashboard", href: "/Dashboard?tab=cards", auth: true },
    { label: "Lebensgeschichten", page: "Dashboard", href: "/Dashboard?tab=book", auth: true },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAF8" }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 64,
          background: "rgba(15,14,12,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(201,169,110,0.12)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 shrink-0">
            <span style={{ color: "#c9a96e", fontSize: 14, lineHeight: 1 }}>✦</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#e4c99a", letterSpacing: "0.02em" }}>
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
                    className="px-4 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: isActive(link.page) ? "#f0ede8" : "#8a8278" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
                    onMouseLeave={e => e.currentTarget.style.color = isActive(link.page) ? "#f0ede8" : "#8a8278"}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link
                to={createPageUrl("AdminDashboard")}
                className="px-4 py-2 rounded-lg text-sm transition-colors duration-150 flex items-center gap-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: isActive("AdminDashboard") ? "#f0ede8" : "#8a8278" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
                onMouseLeave={e => e.currentTarget.style.color = isActive("AdminDashboard") ? "#f0ede8" : "#8a8278"}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              to="/B2BRegister"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#c9a96e" }}
            >
              Für Bestatter
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm truncate max-w-[140px]" style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#8a8278"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                style={{
                  background: "#c9a96e",
                  color: "#0f0e0c",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Anmelden
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#8a8278" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96" : "max-h-0"}`}
          style={{ background: "rgba(15,14,12,0.98)", borderBottom: menuOpen ? "1px solid rgba(201,169,110,0.12)" : "none" }}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className="block px-4 py-3 rounded-xl text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "#8a8278" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link
                to={createPageUrl("AdminDashboard")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ color: "#8a8278" }}
                onClick={() => setMenuOpen(false)}
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
              <Link to="/B2BRegister" className="block px-4 py-3 rounded-xl text-sm" style={{ color: "#c9a96e" }} onClick={() => setMenuOpen(false)}>
                Für Bestatter →
              </Link>
              {user ? (
                <button
                  onClick={() => { setMenuOpen(false); base44.auth.logout(); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm"
                  style={{ color: "#8a8278" }}
                >
                  {user.full_name || user.email} · Abmelden
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); base44.auth.redirectToLogin(createPageUrl("Dashboard")); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: "#c9a96e", color: "#0f0e0c" }}
                >
                  Anmelden
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer style={{ background: "#1a1410" }} className="text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 border-b border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#a07830,#c9a96e)" }}>
                  <svg width="14" height="10" viewBox="0 0 36 24" fill="none">
                    <path d="M6 12C6 12 5 5 11 5C15 5 17.5 9 18 12C18.5 15 21 19 25 19C31 19 33 12 33 12C33 12 31 5 25 5C21 5 18.5 9 18 12C17.5 15 15 19 11 19C5 19 3 12 3 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="32" cy="12" r="1.8" fill="#c9a84c"/>
                  </svg>
                </div>
                <span className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#e5d5c0" }}>
                  Ever<span style={{ color: "#c9a84c" }}>trace</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-stone-500">
                Digitale Gedenkkultur mit Würde — Erinnern, Erzählen, Bewahren.
              </p>
              <div className="flex items-center gap-1.5 mt-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="#c9a84c" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
                <span className="text-xs text-stone-400 ml-1">4.9 · Über 500 Gedenkseiten</span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-stone-600 mb-4">Navigation</p>
              <ul className="space-y-2.5 text-sm">
                {[["Startseite", "Home"], ["Dashboard", "Dashboard"], ["Shop", "Shop"]].map(([label, page]) => (
                  <li key={page}>
                    <Link to={createPageUrl(page)} className="hover:text-stone-300 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-stone-600 mb-4">Rechtliches</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/Legal?section=datenschutz" className="hover:text-stone-300 transition-colors">Datenschutz (DSGVO)</Link></li>
                <li><Link to="/Legal?section=impressum" className="hover:text-stone-300 transition-colors">Impressum</Link></li>
                <li><Link to="/Legal?section=agb" className="hover:text-stone-300 transition-colors">AGB</Link></li>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-xs text-stone-600">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>In Deutschland gehostet · ISO-konform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <span>© 2026 Evertrace. Alle Rechte vorbehalten.</span>
          <span>Mit ♥ für würdevolle Erinnerungen</span>
        </div>
      </footer>
    </div>
  );
}