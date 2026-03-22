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
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Worte des Trostes</p>
          <h2
            className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Gedenkbuch
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-xs mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Hinterlassen Sie eine Nachricht — für die Familie und für die Ewigkeit.
          </p>
        </div>

        {/* Entries */}
        {condolences.filter(e => e.status === "approved" || !e.status).length > 0 && (
          <div className="space-y-4 mb-12">
            {condolences.filter(e => e.status === "approved" || !e.status).map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#c9a96e,#a07840)" }}
                    >
                      {entry.author_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{entry.author_name}</p>
                      <p className="text-xs text-gray-400">{formatDate(entry.created_date)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed ml-13 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  „{entry.message}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {submitted ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-100 shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-amber-400/40" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z" fill="#c9a84c" opacity="0.6"/>
                <circle cx="12" cy="12" r="2.5" fill="#c9a84c"/>
              </svg>
              <div className="h-px w-8 bg-amber-400/40" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Vielen Dank für Ihre Worte
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Ihre Nachricht bedeutet der Familie sehr viel und wird nach kurzer Prüfung sichtbar.
            </p>
            <button
              className="mt-6 text-sm underline-offset-4 hover:underline transition-all"
              style={{ color: "#c9a96e" }}
              onClick={() => setSubmitted(false)}
            >
              Weitere Nachricht schreiben
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Feather className="w-4 h-4" style={{ color: "#c9a96e" }} />
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Ihre Worte an die Familie
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Ihr Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Vor- und Nachname"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1.5">Ihre Nachricht</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Teilen Sie eine Erinnerung, ein Gebet oder einfach Ihr Mitgefühl..."
                  className="rounded-xl h-32 resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ihre Nachricht wird von der Familie gesichtet, bevor sie erscheint.
              </p>
              <Button
                onClick={submit}
                disabled={!form.name.trim() || !form.message.trim() || loading}
                className="w-full text-white rounded-xl py-5"
                style={{ background: "#c9a96e" }}
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