import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function formatDate(d) {
  try { return format(new Date(d), "d. MMM yyyy", { locale: de }); }
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
        <div className="text-center mb-12">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-amber-700" />
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Kondolenzbuch
          </h2>
          <p className="text-gray-500 mt-2 font-light">Hinterlassen Sie eine persönliche Nachricht</p>
        </div>

        {/* Entries */}
        {condolences.length > 0 && (
          <div className="space-y-4 mb-10">
            {condolences.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ background: "linear-gradient(135deg,#b45309,#92400e)" }}
                    >
                      {entry.author_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <p className="font-semibold text-gray-800">{entry.author_name}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(entry.created_date)}</p>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-13">{entry.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {submitted ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "#ecfdf5" }}>
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Vielen Dank für Ihren Eintrag
            </h3>
            <p className="text-gray-500 text-sm">Ihre Nachricht wird nach Prüfung hier erscheinen.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setSubmitted(false)}>
              Weitere Nachricht schreiben
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Kondolenz hinterlassen
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ihr Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Vor- und Nachname"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ihre Nachricht *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Teilen Sie eine Erinnerung oder Ihr Mitgefühl..."
                  className="rounded-xl h-28 resize-none"
                />
              </div>
              <p className="text-xs text-gray-400">Ihre Nachricht wird vor der Veröffentlichung moderiert.</p>
              <Button
                onClick={submit}
                disabled={!form.name.trim() || !form.message.trim() || loading}
                className="w-full text-white rounded-xl py-5"
                style={{ background: "#b45309" }}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Kondolenz einreichen
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}