import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: "beruf",        label: "Berufliches" },
  { value: "ehrenamt",     label: "Ehrenamt" },
  { value: "zitat",        label: "Lieblingszitat" },
  { value: "ratschlag",    label: "Ratschläge" },
  { value: "leidenschaft", label: "Leidenschaft" },
  { value: "leistung",     label: "Errungenschaft" },
];

export default function LegacyEditor({ memorialId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "leistung", title: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LegacyEntry.filter({ memorial_id: memorialId }, "sort_order").then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [memorialId]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = async () => {
    if (!form.title) return;
    setSaving(true);
    const entry = await base44.entities.LegacyEntry.create({ ...form, memorial_id: memorialId, sort_order: entries.length });
    setEntries(p => [...p, entry]);
    setForm({ category: "leistung", title: "", description: "" });
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.LegacyEntry.delete(id);
    setEntries(p => p.filter(e => e.id !== id));
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>;

  return (
    <div className="space-y-6">
      <div className="border border-stone-200 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-700 text-sm">Neuer Eintrag</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Kategorie</Label>
            <select value={form.category} onChange={e => setF("category", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Titel *</Label>
            <Input value={form.title} onChange={e => setF("title", e.target.value)}
              placeholder="z.B. 30 Jahre als Lehrer" className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Beschreibung</Label>
          <Textarea value={form.description} onChange={e => setF("description", e.target.value)}
            className="mt-1 h-20 resize-none" placeholder="Details oder Hintergrund..." />
        </div>
        <Button onClick={add} disabled={saving || !form.title} size="sm" className="rounded-xl" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
          Hinzufügen
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Noch keine Einträge. Erzählen Sie vom Lebenswerk.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#c9a96e" }}>
                  {CATEGORIES.find(c => c.value === entry.category)?.label}
                </span>
                <p className="font-medium text-gray-800 text-sm mt-0.5">{entry.title}</p>
                {entry.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.description}</p>}
              </div>
              <button onClick={() => remove(entry.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 mt-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}