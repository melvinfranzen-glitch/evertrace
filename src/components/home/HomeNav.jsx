import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X } from "lucide-react";
import EvertraceLogo from "@/components/EvertraceLogo";

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Gedenkseiten", href: createPageUrl("Dashboard") + "?tab=memorials" },
    { label: "Trauerkarten", href: createPageUrl("Dashboard") + "?tab=cards" },
    { label: "Lebensgeschichten", href: createPageUrl("Dashboard") + "?tab=book" },
  ];

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "rgba(15,14,12,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,169,110,0.12)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
          <EvertraceLogo variant="dark" size="sm" />
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="px-4 py-2 rounded-lg text-sm transition-colors duration-150"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "#A89A8A" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F7F3ED"}
              onMouseLeave={e => e.currentTarget.style.color = "#A89A8A"}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link
            to="/B2BRegister"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "#B07B34" }}
          >
            Für Bestatter
          </Link>
          <button
            onClick={() => user ? window.location.href = createPageUrl("Dashboard") : base44.auth.redirectToLogin()}
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
            {user ? "Dashboard" : "Anmelden"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Menü öffnen"
          aria-expanded={menuOpen}
          style={{ color: "#8a8278" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: menuOpen ? 400 : 0,
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? 'visible' : 'hidden',
          background: "rgba(47,45,42,0.98)",
          borderBottom: menuOpen ? "1px solid rgba(176,123,52,0.12)" : "none",
        }}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((l) => {
            const isActive = window.location.pathname + window.location.search === l.href;
            return (
            <Link
              key={l.label}
              to={l.href}
              className="block px-4 py-3 rounded-xl text-sm"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, background: isActive ? "rgba(176,123,52,0.1)" : "transparent", color: isActive ? "#B07B34" : "#A89A8A" }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
            );
          })}
          <div className="pt-3 border-t space-y-2" style={{ borderColor: "rgba(176,123,52,0.12)" }}>
            <Link
              to="/B2BRegister"
              className="block px-4 py-3 rounded-xl text-sm"
              style={{ color: "#B07B34" }}
              onClick={() => setMenuOpen(false)}
            >
              Für Bestatter →
            </Link>
            <button
              onClick={() => { setMenuOpen(false); user ? window.location.href = createPageUrl("Dashboard") : base44.auth.redirectToLogin(); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#B07B34", color: "#F7F3ED", fontWeight: 400 }}
            >
              {user ? "Dashboard" : "Anmelden"}
            </button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}