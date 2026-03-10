import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Heart, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MemoryWallSection({ memorialId, entries }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: "", relation: "", message: "", photo_url: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localEntries] = useState(entries || []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setF("photo_url", file_url);
    setUploading(false);
  };

  const submit = async () => {
    if (!form.author_name || !form.message) return;
    setSubmitting(true);
    await base44.entities.MemoryWallEntry.create({ ...form, memorial_id: memorialId, status: "pending" });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
  };

  return (
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Gemeinsam erinnern</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Erinnerungswand
          </h2>
          <p className="text-gray-400 text-sm font-light max-w-sm mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
            Teilen Sie eine persönliche Geschichte, ein Foto oder einen Moment, der Ihnen am Herzen liegt.
          </p>

          {!showForm && !submitted && (
            <Button
              onClick={() => setShowForm(true)}
              className="mt-6 text-white rounded-full px-7"
              style={{ background: "#b45309" }}
            >
              <Heart className="w-4 h-4 mr-2" /> Eine Erinnerung teilen
            </Button>
          )}
          {submitted && (
            <div
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
              style={{ background: "rgba(180,83,9,0.08)", color: "#92400e", fontFamily: "'Playfair Display', serif" }}
            >
              ✦ Danke — Ihre Erinnerung wird nach Prüfung hier erscheinen.
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-stone-100 p-7 mb-10 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Ihre persönliche Erinnerung
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">Ihr Name</label>
                  <Input value={form.author_name} onChange={e => setF("author_name", e.target.value)} placeholder="z.B. Maria Müller" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">Wie kannten Sie sich?</label>
                  <Input value={form.relation} onChange={e => setF("relation", e.target.value)} placeholder="z.B. Tochter, Freundin, Kollege" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">Ihre Erinnerung</label>
                <Textarea
                  value={form.message}
                  onChange={e => setF("message", e.target.value)}
                  placeholder="Ein besonderer Moment, eine Anekdote, ein Dankeschön — ganz wie Sie möchten..."
                  className="h-28 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Foto beifügen (optional)</label>
                {form.photo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photo_url} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Hochgeladen" />
                    <button className="text-xs hover:text-red-500 transition-colors" style={{ color: "#a09070" }} onClick={() => setF("photo_url", "")}>
                      Entfernen
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-stone-200 rounded-xl p-3 hover:border-amber-400 transition-colors w-fit">
                    {uploading
                      ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                      : <Camera className="w-4 h-4 text-stone-400" />}
                    <span className="text-sm text-gray-400">{uploading ? "Wird hochgeladen..." : "Foto hochladen"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                  </label>
                )}
              </div>
              <Button
                onClick={submit}
                disabled={submitting || !form.author_name || !form.message}
                className="w-full text-white rounded-xl py-5"
                style={{ background: "#b45309" }}
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  : <Send className="w-4 h-4 mr-2" />}
                Erinnerung der Familie widmen
              </Button>
            </div>
          </div>
        )}

        {localEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {localEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                {entry.photo_url && (
                  <img src={entry.photo_url} alt="" className="w-full h-40 object-cover rounded-xl mb-5" />
                )}
                <p className="text-gray-600 text-sm leading-relaxed italic mb-5"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  „{entry.message}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#b45309,#92400e)" }}>
                    {entry.author_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{entry.author_name}</p>
                    {entry.relation && <p className="text-xs text-gray-400">{entry.relation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="text-center text-gray-300 py-8">
              <Camera className="w-7 h-7 mx-auto mb-2 opacity-30" />
              <p className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                Noch keine Erinnerungen geteilt — seien Sie der Erste.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}