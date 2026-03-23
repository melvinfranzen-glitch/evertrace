import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function formatDate(d) {
  try { return format(new Date(d), "d. MMMM yyyy", { locale: de }); }
  catch { return ""; }
}

export default function CondolenceBook({ memorialId, condolences }) {
  const [form, setForm] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) return;
    setLoading(true);
    await base44.entities.CondolenceEntry.create({
      memorial_id: memorialId,
      author_name: form.name,
      message: form.message,
      status: "pending",
    });
    setLoading(false);
    setSubmitted(true);
    setForm({ name: "", message: "" });
  };

  return (
    <section className="py-20 px-6" style={{ background: "#F7F3ED" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 11, color: "#B07B34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Worte des Trostes</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 36, color: "#2F2D2A", marginBottom: 10 }}>
            Gedenkbuch
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 16, color: "#A89A8A", maxWidth: 280, margin: "0 auto" }}>
            Hinterlassen Sie eine Nachricht — für die Familie und für die Ewigkeit.
          </p>
        </div>

        {/* Entries */}
        {condolences.filter(e => e.status === "approved" || !e.status).length > 0 && (
          <div className="space-y-4 mb-12">
            {condolences.filter(e => e.status === "approved" || !e.status).map((entry) => (
              <div key={entry.id}
                style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", borderRadius: 14, padding: "22px 26px", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(47,45,42,0.06)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #D8C3A5, #EDE3D3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#2F2D2A" }}>{entry.author_name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 14, color: "#2F2D2A" }}>{entry.author_name}</p>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#A89A8A" }}>{formatDate(entry.created_date)}</p>
                  </div>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: 16, color: "#6B6257", lineHeight: 1.85 }}>
                  <span style={{ color: "#D8C3A5" }}>„</span>{entry.message}<span style={{ color: "#D8C3A5" }}>"</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {submitted ? (
          <div style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", borderRadius: 14, padding: "40px", textAlign: "center" }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8" style={{ background: "rgba(176,123,52,0.3)" }} />
              <span style={{ color: "#B07B34", fontSize: 14 }}>✦</span>
              <div className="h-px w-8" style={{ background: "rgba(176,123,52,0.3)" }} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, color: "#2F2D2A", marginBottom: 10 }}>
              Vielen Dank für Ihre Worte
            </h3>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 14, color: "#A89A8A", lineHeight: 1.7, maxWidth: 280, margin: "0 auto 20px" }}>
              Ihre Nachricht bedeutet der Familie sehr viel und wird nach kurzer Prüfung sichtbar.
            </p>
            <button
              style={{ color: "#B07B34", fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}
              onClick={() => setSubmitted(false)}
            >
              Weitere Nachricht schreiben
            </button>
          </div>
        ) : (
          <div style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", borderRadius: 14, padding: "32px" }}>
            <div className="flex items-center gap-2 mb-6">
              <Feather className="w-4 h-4" style={{ color: "#B07B34" }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, color: "#2F2D2A" }}>
                Ihre Worte an die Familie
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "#6B6257", display: "block", marginBottom: 6 }}>Ihr Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Vor- und Nachname"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 13, color: "#6B6257", display: "block", marginBottom: 6 }}>Ihre Nachricht</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Teilen Sie eine Erinnerung, ein Gebet oder einfach Ihr Mitgefühl..."
                  className="rounded-xl h-32 resize-none"
                />
              </div>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#A89A8A" }}>
                Ihre Nachricht wird von der Familie gesichtet, bevor sie erscheint.
              </p>
              <Button
                onClick={submit}
                disabled={!form.name.trim() || !form.message.trim() || loading}
                className="w-full rounded-xl py-5"
                style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif", fontWeight: 400 }}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <Send className="w-4 h-4 mr-2" />}
                Nachricht senden
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}