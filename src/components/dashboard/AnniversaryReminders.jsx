import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO, setYear, format, addYears } from "date-fns";
import { de } from "date-fns/locale";
import { Bell, Cake, Heart, PenLine, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

function getDaysUntilNextAnniversary(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseISO(dateStr);
  let next = setYear(date, today.getFullYear());
  next.setHours(0, 0, 0, 0);
  if (next < today) next = addYears(next, 1);
  return differenceInDays(next, today);
}

function getAnniversaryYear(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const date = parseISO(dateStr);
  let next = setYear(date, today.getFullYear());
  if (next < today) return today.getFullYear() - date.getFullYear() + 1;
  return today.getFullYear() - date.getFullYear();
}

export default function AnniversaryReminders({ memorials }) {
  const [reminders, setReminders] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("et_dismissed_reminders") || "[]"); } catch { return []; }
  });
  const [blogModal, setBlogModal] = useState(null); // { memorial, occasion, year }
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date();
    const upcoming = [];
    memorials.forEach((m) => {
      if (m.birth_date) {
        const days = getDaysUntilNextAnniversary(m.birth_date);
        if (days !== null && days <= 14) {
          const year = getAnniversaryYear(m.birth_date);
          const key = `${m.id}-geburtstag-${today.getFullYear()}`;
          upcoming.push({ key, memorial: m, occasion: "geburtstag", days, year, date: m.birth_date });
        }
      }
      if (m.death_date) {
        const days = getDaysUntilNextAnniversary(m.death_date);
        if (days !== null && days <= 14) {
          const year = getAnniversaryYear(m.death_date);
          const key = `${m.id}-todestag-${today.getFullYear()}`;
          upcoming.push({ key, memorial: m, occasion: "todestag", days, year, date: m.death_date });
        }
      }
    });
    upcoming.sort((a, b) => a.days - b.days);
    setReminders(upcoming);
  }, [memorials]);

  const visibleReminders = reminders.filter((r) => !dismissed.includes(r.key));

  const dismiss = (key) => {
    const updated = [...dismissed, key];
    setDismissed(updated);
    localStorage.setItem("et_dismissed_reminders", JSON.stringify(updated));
  };

  const openBlogModal = async (reminder) => {
    const occasionLabel = reminder.occasion === "geburtstag" ? "Geburtstag" : "Todestag";
    const defaultTitle = reminder.days === 0
      ? `${reminder.year}. ${occasionLabel} von ${reminder.memorial.name}`
      : `In ${reminder.days} Tagen: ${reminder.year}. ${occasionLabel} von ${reminder.memorial.name}`;
    setBlogTitle(defaultTitle);
    setBlogContent("");
    setBlogModal(reminder);
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Schreibe einen einfühlsamen, kurzen Blog-Eintrag (ca. 3 Absätze) für eine digitale Gedenkseite anlässlich des ${reminder.year}. ${occasionLabel}s von ${reminder.memorial.name}${reminder.memorial.biography ? `. Hier ist etwas über die Person: ${reminder.memorial.biography.slice(0, 400)}` : ""}. Der Ton soll würdevoll und warmherzig sein.`,
    });
    setBlogContent(result);
    setGenerating(false);
  };

  const saveBlogPost = async () => {
    setSaving(true);
    await base44.entities.MemorialBlogPost.create({
      memorial_id: blogModal.memorial.id,
      title: blogTitle,
      content: blogContent,
      occasion: blogModal.occasion,
      occasion_year: blogModal.year,
      is_published: true,
    });
    setSaving(false);
    dismiss(blogModal.key);
    setBlogModal(null);
  };

  if (visibleReminders.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4" style={{ color: "#c9a96e" }} />
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#c9a96e" }}>Bevorstehende Jahrestage</h2>
        </div>
        <div className="space-y-3">
          {visibleReminders.map((r) => (
            <div
              key={r.key}
              className="flex items-start gap-4 rounded-2xl px-5 py-4"
              style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)" }}
            >
              <div className="mt-0.5">
                {r.occasion === "geburtstag"
                  ? <Cake className="w-5 h-5 text-amber-600" />
                  : <Heart className="w-5 h-5 text-rose-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {r.days === 0
                    ? `Heute ist der ${r.year}. ${r.occasion === "geburtstag" ? "Geburtstag" : "Todestag"} von ${r.memorial.name}`
                    : `In ${r.days} Tag${r.days === 1 ? "" : "en"}: ${r.year}. ${r.occasion === "geburtstag" ? "Geburtstag" : "Todestag"} von ${r.memorial.name}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(parseISO(r.date), "d. MMMM", { locale: de })}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="text-white text-xs rounded-lg h-7 px-3"
                    style={{ background: "#b45309" }}
                    onClick={() => openBlogModal(r)}
                  >
                    <PenLine className="w-3 h-3 mr-1" />
                    Blog-Eintrag erstellen
                  </Button>
                </div>
              </div>
              <button
                onClick={() => dismiss(r.key)}
                className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Blog modal */}
      {blogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-gray-800">Neuer Blog-Eintrag</h3>
              </div>
              <button onClick={() => setBlogModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Titel</label>
                <Input
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                  Inhalt
                  {generating && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                  {generating && <span className="text-amber-600">KI schreibt…</span>}
                </label>
                <Textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  rows={10}
                  className="rounded-xl text-sm leading-relaxed"
                  placeholder="KI-generierter Inhalt erscheint hier…"
                  disabled={generating}
                />
              </div>
            </div>
            <div className="px-6 pb-5 pt-3 border-t border-stone-100 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setBlogModal(null)}>
                Abbrechen
              </Button>
              <Button
                onClick={saveBlogPost}
                disabled={saving || generating || !blogContent.trim()}
                className="text-white rounded-xl"
                style={{ background: "#b45309" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Veröffentlichen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}