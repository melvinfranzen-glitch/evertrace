import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X } from "lucide-react";

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Gedenkseiten", href: createPageUrl("Dashboard") },
    { label: "Trauerkarten", href: createPageUrl("Dashboard") },
    { label: "Erinnerungsstücke", href: createPageUrl("Shop") },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: 64,
        background: "rgba(15,14,12,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,169,110,0.12)",
        transform: scrolled || menuOpen ? "translateY(0)" : "translateY(0)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
          <span style={{ color: "#c9a96e", fontSize: 14, lineHeight: 1 }}>✦</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#e4c99a", letterSpacing: "0.02em" }}>
            Evertrace
          </span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="px-4 py-2 rounded-lg text-sm transition-colors duration-150"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a8278" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
              onMouseLeave={e => e.currentTarget.style.color = "#8a8278"}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link
            to="/B2BRegister"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#c9a96e" }}
          >
            Für Bestatter
          </Link>
          <button
            onClick={() => user ? window.location.href = createPageUrl("Dashboard") : base44.auth.redirectToLogin()}
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
            {user ? "Dashboard" : "Anmelden"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#8a8278" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? 320 : 0,
          background: "rgba(15,14,12,0.98)",
          borderBottom: menuOpen ? "1px solid rgba(201,169,110,0.12)" : "none",
        }}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="block px-4 py-3 rounded-xl text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#8a8278" }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t space-y-2" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
            <Link
              to="/B2BRegister"
              className="block px-4 py-3 rounded-xl text-sm"
              style={{ color: "#c9a96e" }}
              onClick={() => setMenuOpen(false)}
            >
              Für Bestatter →
            </Link>
            <button
              onClick={() => { setMenuOpen(false); user ? window.location.href = createPageUrl("Dashboard") : base44.auth.redirectToLogin(); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}
            >
              {user ? "Dashboard" : "Anmelden"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}