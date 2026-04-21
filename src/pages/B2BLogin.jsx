import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, LogIn, ArrowRight } from "lucide-react";

export default function B2BLogin() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        // If already funeral_director, redirect to dashboard directly
        if (me.role === "funeral_director" || me.role === "admin") {
          window.location.replace("/B2BDashboard");
          return;
        }
      }
      setChecking(false);
    });
  }, []);

  const handleSwitchAccount = async () => {
    setSwitching(true);
    await base44.auth.logout("/B2BLogin");
  };

  const handleLoginAsFuneralDirector = () => {
    base44.auth.redirectToLogin("/B2BDashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0e0c" }}>
        <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-8 py-5 flex items-center justify-between border-b" style={{ borderColor: "#302d28" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#c9a96e" }}>
            <span style={{ color: "#0f0e0c", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14 }}>E</span>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8", fontSize: 20, fontWeight: 600 }}>Evertrace</span>
          <span style={{ color: "#5a554e", marginLeft: 8 }}>— Bestatter-Portal</span>
        </div>
        <Link to="/" className="text-sm transition-colors" style={{ color: "#8a8278" }}
          onMouseEnter={e => e.currentTarget.style.color = "#f0ede8"}
          onMouseLeave={e => e.currentTarget.style.color = "#8a8278"}>
          ← Zur Startseite
        </Link>
      </div>

      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)" }}>
          <Building2 className="w-8 h-8" style={{ color: "#c9a96e" }} />
        </div>

        <h1 className="text-4xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
          Bestatter-Login
        </h1>
        <p className="mb-10 leading-relaxed" style={{ color: "#8a8278" }}>
          Das Bestatter-Portal ist für registrierte Bestattungsunternehmen. Melden Sie sich mit Ihrem Bestatter-Konto an.
        </p>

        {/* User is logged in as a private user */}
        {user ? (
          <div className="rounded-2xl p-6 mb-6 text-left" style={{ background: "#181714", border: "1px solid #302d28" }}>
            <p className="text-sm mb-1" style={{ color: "#8a8278" }}>Aktuell angemeldet als</p>
            <p className="font-medium mb-1" style={{ color: "#f0ede8" }}>{user.full_name || user.email}</p>
            <p className="text-xs mb-5" style={{ color: "#5a554e" }}>
              Dieses Konto hat keinen Bestatter-Zugang. Um das Bestatter-Portal zu nutzen, müssen Sie sich mit einem Bestatter-Konto anmelden.
            </p>
            <button
              onClick={handleSwitchAccount}
              disabled={switching}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              {switching
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {switching ? "Abmelden…" : "Abmelden & als Bestatter anmelden"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleLoginAsFuneralDirector}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-4 transition-all"
            style={{ background: "#c9a96e", color: "#0f0e0c" }}>
            <LogIn className="w-4 h-4" />
            Als Bestatter anmelden
          </button>
        )}

        <div className="text-center mt-4">
          <span style={{ color: "#5a554e", fontSize: 13 }}>Noch kein Konto? </span>
          <Link to="/B2BRegister" className="text-sm transition-colors" style={{ color: "#c9a96e" }}>
            Jetzt als Bestatter registrieren →
          </Link>
        </div>
      </div>
    </div>
  );
}