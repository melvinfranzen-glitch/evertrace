import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemorialCard from "@/components/memorial/MemorialCard";
import AnniversaryReminders from "@/components/dashboard/AnniversaryReminders";
import PlaqueOrderTab from "@/components/dashboard/PlaqueOrderTab";
import LifeBookTab from "@/components/dashboard/LifeBookTab";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get("tab");
  const urlMemorialId = urlParams.get("memorial_id");

  const [activeTab, setActiveTab] = useState(
    urlTab === "plaque" ? "plaque" : urlTab === "book" ? "book" : "memorials"
  );

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { base44.auth.redirectToLogin(createPageUrl("Dashboard")); return; }
      setUser(u);
      const data = await base44.entities.Memorial.filter({ created_by: u.email }, "-created_date");
      setMemorials(data);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin font-medium" />
      </div>
    );
  }

  const TABS = [
    { id: "memorials", label: "Meine Gedenkseiten" },
    { id: "plaque", label: "Grabplakette bestellen" },
    { id: "book", label: "Lebensgeschichten-Buch" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Meine Gedenkseiten
            </h1>
            <p className="text-gray-500 mt-1">Willkommen zurück, {user?.full_name || user?.email}</p>
          </div>
          <Button
            onClick={() => window.location.href = createPageUrl("CreateMemorial")}
            className="text-white rounded-xl px-6"
            style={{ background: "#c9a96e" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Neue Gedenkseite
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8" style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 transition-all"
              style={{
                background: activeTab === tab.id ? "rgba(201,169,110,0.15)" : "white",
                border: `1px solid ${activeTab === tab.id ? "rgba(201,169,110,0.4)" : "#e5e7eb"}`,
                color: activeTab === tab.id ? "#c9a96e" : "#6b7280",
                borderRadius: 24,
                padding: "8px 20px",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Meine Gedenkseiten */}
        {activeTab === "memorials" && (
          <>
            <AnniversaryReminders memorials={memorials} />
            {memorials.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6" style={{ background: "#f5f0e8" }}>
                  <BookOpen className="w-10 h-10 font-medium" style={{ color: "#c9a96e" }} />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Noch keine Gedenkseite
                </h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Erstellen Sie Ihre erste digitale Gedenkseite und bewahren Sie die Erinnerung an einen geliebten Menschen.
                </p>
                <Button
                  onClick={() => window.location.href = createPageUrl("CreateMemorial")}
                  className="text-white rounded-xl px-8"
                  style={{ background: "#c9a96e" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Gedenkseite erstellen
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {memorials.map((m) => (
                  <MemorialCard key={m.id} memorial={m} onDelete={(id) => setMemorials((p) => p.filter((x) => x.id !== id))} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Grabplakette */}
        {activeTab === "plaque" && (
          <PlaqueOrderTab memorials={memorials} initialMemorialId={urlMemorialId} />
        )}

        {/* Tab: Lebensgeschichten-Buch */}
        {activeTab === "book" && (
          <LifeBookTab memorials={memorials} />
        )}
      </div>
    </div>
  );
}