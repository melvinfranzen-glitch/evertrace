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
  const [localEntries, setLocalEntries] = useState(entries || []);

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
    <section className="py-20 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Gemeinschaft</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Erinnerungswand
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Teilen Sie eine persönliche Erinnerung, eine Anekdote oder ein Foto mit der Familie.
          </p>
          {!showForm && !submitted && (
            <Button onClick={() => setShowForm(true)} className="text-white rounded-xl" style={{ background: "#b45309" }}>
              <Heart className="w-4 h-4 mr-2" /> Erinnerung teilen
            </Button>
          )}
          {submitted && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#fef3c7", color: "#92400e" }}>
              ✓ Danke! Ihre Erinnerung wird nach Prüfung angezeigt.
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-10 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Ihre Erinnerung</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Ihr Name *</label>
                  <Input value={form.author_name} onChange={e => setF("author_name", e.target.value)} placeholder="z.B. Maria Müller" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Beziehung</label>
                  <Input value={form.relation} onChange={e => setF("relation", e.target.value)} placeholder="z.B. Tochter, Freundin, Kollege" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ihre Erinnerung *</label>
                <Textarea value={form.message} onChange={e => setF("message", e.target.value)}
                  placeholder="Teilen Sie eine besondere Erinnerung, eine Anekdote oder persönliche Worte..."
                  className="h-28 resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Foto hinzufügen (optional)</label>
                {form.photo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photo_url} className="w-16 h-16 rounded-lg object-cover" alt="Hochgeladen" />
                    <button className="text-xs text-red-400 hover:text-red-600" onClick={() => setF("photo_url", "")}>Entfernen</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-stone-300 rounded-xl p-3 hover:border-amber-400 transition-colors w-fit">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-stone-400" /> : <Camera className="w-4 h-4 text-stone-400" />}
                    <span className="text-sm text-gray-500">{uploading ? "Lädt hoch..." : "Foto hochladen"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
                  </label>
                )}
              </div>
              <Button onClick={submit} disabled={submitting || !form.author_name || !form.message}
                className="w-full text-white rounded-xl" style={{ background: "#b45309" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Erinnerung einreichen
              </Button>
            </div>
          </div>
        )}

        {localEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {localEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                {entry.photo_url && (
                  <img src={entry.photo_url} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <p className="text-gray-600 text-sm leading-relaxed italic mb-4">„{entry.message}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "#b45309" }}>
                    {entry.author_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{entry.author_name}</p>
                    {entry.relation && <p className="text-xs text-gray-400">{entry.relation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="text-center text-gray-400 py-8">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Noch keine Erinnerungen geteilt. Seien Sie der Erste!</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}