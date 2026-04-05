import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X, Shield, LogOut } from "lucide-react";
import EvertraceLogo from "@/components/EvertraceLogo";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => { setMenuOpen(false); }, [currentPageName]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isMemorialPage = currentPageName === "MemorialProfile";
  if (isMemorialPage) return <>{children}</>;

  const FooterBlock = () => (
    <footer style={{ background: "#2F2D2A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 border-b" style={{ borderColor: "#3A332C" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link to={createPageUrl("Home")} className="inline-block mb-5">
              <EvertraceLogo variant="dark" size="sm" />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
              Digitale Gedenkkultur mit Würde — Erinnern, Erzählen, Bewahren.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#B07B34" }} />
              <span className="text-xs" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                Digitale Gedenkkultur — im Aufbau. Seien Sie dabei.
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#6B6257", letterSpacing: "0.2em" }}>Produkte</p>
            <ul className="space-y-2.5">
              {[["Gedenkseiten", "Dashboard?tab=memorials"], ["Gedenkbücher", "Dashboard?tab=book"], ["Trauerkarten", "Dashboard?tab=cards"], ["Startseite", "Home"]].map(([label, page]) => (
                <li key={page}>
                  <Link to={createPageUrl(page)}
                    className="text-sm transition-colors"
                    style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#D8C3A5"}
                    onMouseLeave={e => e.currentTarget.style.color = "#6B6257"}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#6B6257", letterSpacing: "0.2em" }}>Rechtliches</p>
            <ul className="space-y-2.5">
              {[["Datenschutz (DSGVO)", "/Legal?section=datenschutz"], ["Impressum", "/Legal?section=impressum"], ["AGB", "/Legal?section=agb"]].map(([label, href]) => (
                <li key={href}>
                  <Link to={href}
                    className="text-sm transition-colors"
                    style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#D8C3A5"}
                    onMouseLeave={e => e.currentTarget.style.color = "#6B6257"}
                  >{label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6B6257", letterSpacing: "0.2em" }}>Kontakt</p>
              <a href="mailto:hallo@evertrace.de"
                className="text-sm transition-colors"
                style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
                onMouseEnter={e => e.currentTarget.style.color = "#D8C3A5"}
                onMouseLeave={e => e.currentTarget.style.color = "#6B6257"}
              >hallo@evertrace.de</a>
            </div>
            <div className="mt-4">
              <Link to="/B2BRegister"
                className="text-sm transition-colors"
                style={{ color: "#B07B34", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}
              >Für Bestatter →</Link>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif" }}>In Deutschland gehostet · ISO-konform</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-xs" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>© 2026 Evertrace. Alle Rechte vorbehalten.</span>
        <span className="text-xs" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Mit ♥ für würdevolle Erinnerungen</span>
      </div>
    </footer>
  );

  const isHomePage = currentPageName === "Home";
  if (isHomePage) return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Lato', sans-serif", background: "#F7F3ED" }}>
      <main className="flex-1">{children}</main>
      <FooterBlock />
    </div>
  );

  const navLinks = [
    { label: "Gedenkseiten", page: "Dashboard", href: "/Dashboard?tab=memorials", auth: true },
    { label: "Trauerkarten", page: "Dashboard", href: "/Dashboard?tab=cards", auth: true },
    { label: "Lebensgeschichten", page: "Dashboard", href: "/Dashboard?tab=book", auth: true },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Lato', sans-serif", background: "#F7F3ED" }}>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(47,45,42,0.94)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(176,123,52,0.12)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 shrink-0">
            <EvertraceLogo variant="dark" size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={link.href || createPageUrl(link.page)}
                    className="px-4 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 300, color: isActive(link.page) ? "#F7F3ED" : "#A89A8A" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#F7F3ED"}
                    onMouseLeave={e => e.currentTarget.style.color = isActive(link.page) ? "#F7F3ED" : "#A89A8A"}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link
                to={createPageUrl("AdminDashboard")}
                className="px-4 py-2 rounded-lg text-sm transition-colors duration-150 flex items-center gap-1.5"
                style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 300, color: isActive("AdminDashboard") ? "#F7F3ED" : "#A89A8A" }}
                onMouseEnter={e => e.currentTarget.style.color = "#F7F3ED"}
                onMouseLeave={e => e.currentTarget.style.color = isActive("AdminDashboard") ? "#F7F3ED" : "#A89A8A"}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            {!user && (
              <Link to="/B2BRegister"
                style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 300, color: "#B07B34" }}>
                Für Bestatter
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm truncate max-w-[140px]" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 300 }}>
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => base44.auth.logout()}
                  aria-label="Abmelden"
                  className="flex items-center gap-1.5"
                  style={{ color: "#A89A8A" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F7F3ED"}
                  onMouseLeave={e => e.currentTarget.style.color = "#A89A8A"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                style={{
                  background: "#B07B34",
                  color: "#F7F3ED",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Anmelden
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#A89A8A" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? '420px' : 0,
            opacity: menuOpen ? 1 : 0,
            visibility: menuOpen ? 'visible' : 'hidden',
            background: "rgba(47,45,42,0.98)",
            borderBottom: menuOpen ? "1px solid rgba(176,123,52,0.12)" : "none",
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(
              (link) =>
                (!link.auth || user) && (
                  <Link
                    key={link.page}
                    to={link.href || createPageUrl(link.page)}
                    className="block px-4 py-3 rounded-xl text-sm"
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#A89A8A" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
            )}
            {user?.role === "admin" && (
              <Link to={createPageUrl("AdminDashboard")}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ color: "#A89A8A" }}
                onClick={() => setMenuOpen(false)}>
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: "rgba(176,123,52,0.12)" }}>
              <Link to="/B2BRegister" className="block px-4 py-3 rounded-xl text-sm"
                style={{ color: "#B07B34" }} onClick={() => setMenuOpen(false)}>
                Für Bestatter →
              </Link>
              {user ? (
                <button
                  onClick={() => { setMenuOpen(false); base44.auth.logout(); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm"
                  style={{ color: "#A89A8A" }}>
                  {user.full_name || user.email} · Abmelden
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); base44.auth.redirectToLogin(createPageUrl("Dashboard")); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm"
                  style={{ background: "#B07B34", color: "#F7F3ED", fontWeight: 400 }}>
                  Anmelden
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
      <FooterBlock />
    </div>
  );
}