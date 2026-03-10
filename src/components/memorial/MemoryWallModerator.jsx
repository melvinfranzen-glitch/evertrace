import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MemoryWallModerator({ memorialId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    base44.entities.MemoryWallEntry.filter({ memorial_id: memorialId }, "-created_date").then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [memorialId]);

  const approve = async (id) => {
    await base44.entities.MemoryWallEntry.update(id, { status: "approved" });
    setEntries(p => p.map(e => e.id === id ? { ...e, status: "approved" } : e));
  };

  const reject = async (id) => {
    await base44.entities.MemoryWallEntry.delete(id);
    setEntries(p => p.filter(e => e.id !== id));
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>;

  const filtered = entries.filter(e => filter === "all" ? true : e.status === filter);
  const pendingCount = entries.filter(e => e.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Erinnerungswand</h3>
          {pendingCount > 0 && (
            <p className="text-xs font-medium mt-0.5" style={{ color: "#92400e" }}>
              {pendingCount} ausstehende Einträge zur Prüfung
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {[["pending", "Ausstehend"], ["approved", "Genehmigt"], ["all", "Alle"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background: filter === val ? "#b45309" : "#f3f4f6", color: filter === val ? "white" : "#6b7280" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Keine Einträge</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => (
            <div key={entry.id} className="border border-stone-200 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-gray-800">{entry.author_name}</span>
                    {entry.relation && <span className="text-xs text-gray-400">· {entry.relation}</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: entry.status === "approved" ? "#d1fae5" : "#fef3c7",
                      color: entry.status === "approved" ? "#065f46" : "#92400e"
                    }}>
                      {entry.status === "approved" ? "✓ Genehmigt" : "Ausstehend"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{entry.message}</p>
                  {entry.photo_url && <img src={entry.photo_url} className="mt-2 h-20 rounded-lg object-cover" alt="" />}
                </div>
                {entry.status === "pending" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => approve(entry.id)} className="w-8 h-8 text-green-600 hover:bg-green-50">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => reject(entry.id)} className="w-8 h-8 text-red-500 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}