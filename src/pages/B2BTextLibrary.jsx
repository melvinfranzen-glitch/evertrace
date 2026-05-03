import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import B2BLayout from "@/components/b2b/B2BLayout";
import { BookOpen, Trash2, Copy, Check, Tag } from "lucide-react";

export default function B2BTextLibrary() {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.SavedText.filter({ created_by: u.email }, "-created_date", 100)
        .then(data => { setTexts(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, []);

  const copyText = (text) => {
    navigator.clipboard.writeText(text.content);
    setCopiedId(text.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteText = async (id) => {
    if (!window.confirm("Text aus der Bibliothek löschen?")) return;
    await base44.entities.SavedText.delete(id);
    setTexts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <B2BLayout title="Textbibliothek" subtitle="Gespeicherte Trauertexte">
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#181714" }} />
          ))}
        </div>
      ) : texts.length === 0 ? (
        <div className="rounded-2xl py-24 text-center" style={{ background: "#181714", border: "1px solid #302d28" }}>
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#302d28" }} />
          <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
            Noch keine gespeicherten Texte
          </p>
          <p className="text-sm" style={{ color: "#5a554e" }}>
            Im Trauerkarten-Wizard können Sie Texte mit ★ als Favorit speichern.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {texts.map(text => (
            <div key={text.id} className="rounded-2xl p-6" style={{ background: "#181714", border: "1px solid #302d28" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#f0ede8" }}>
                    {text.title || "Trauertext"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {text.religion && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.25)" }}>
                        {text.religion}
                      </span>
                    )}
                    {text.tags && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#5a554e" }}>
                        <Tag className="w-3 h-3" /> {text.tags}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyText(text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: copiedId === text.id ? "rgba(74,222,128,0.1)" : "rgba(201,169,110,0.1)",
                      color: copiedId === text.id ? "#4ade80" : "#c9a96e",
                      border: `1px solid ${copiedId === text.id ? "rgba(74,222,128,0.3)" : "rgba(201,169,110,0.3)"}`,
                    }}>
                    {copiedId === text.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === text.id ? "Kopiert" : "Kopieren"}
                  </button>
                  <button
                    onClick={() => deleteText(text.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "#5a554e" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                    onMouseLeave={e => e.currentTarget.style.color = "#5a554e"}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e", fontSize: 15, lineHeight: 1.9 }}>
                „{text.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </B2BLayout>
  );
}