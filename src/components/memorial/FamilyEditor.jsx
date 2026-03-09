import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users } from "lucide-react";

const RELATION_LABEL = {
  vater: "Vater", mutter: "Mutter",
  grossvater_vaterseite: "Großvater (Vaterseite)", grossmutter_vaterseite: "Großmutter (Vaterseite)",
  grossvater_mutterseite: "Großvater (Mutterseite)", grossmutter_mutterseite: "Großmutter (Mutterseite)",
  bruder: "Bruder", schwester: "Schwester",
  ehepartner: "Ehepartner/in",
  sohn: "Sohn", tochter: "Tochter",
};

const EMPTY = { name: "", relation: "vater", birth_year: "", death_year: "" };

export default function FamilyEditor({ memorialId }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    base44.entities.FamilyMember.filter({ memorial_id: memorialId }).then(setMembers);
  }, [memorialId]);

  const add = async () => {
    if (!form.name || !form.relation) return;
    setAdding(true);
    const created = await base44.entities.FamilyMember.create({ ...form, memorial_id: memorialId });
    setMembers((p) => [...p, created]);
    setForm(EMPTY);
    setAdding(false);
  };

  const remove = async (id) => {
    await base44.entities.FamilyMember.delete(id);
    setMembers((p) => p.filter((m) => m.id !== id));
  };

  const GROUP_ORDER = [
    ["grossvater_vaterseite", "grossmutter_vaterseite", "grossvater_mutterseite", "grossmutter_mutterseite"],
    ["vater", "mutter"],
    ["bruder", "schwester", "ehepartner"],
    ["sohn", "tochter"],
  ];
  const grouped = GROUP_ORDER.map((rels) => members.filter((m) => rels.includes(m.relation))).filter((g) => g.length > 0);

  return (
    <div className="space-y-6">
      {members.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Noch keine Familienmitglieder eingetragen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((group, gi) => (
            <div key={gi} className="space-y-2">
              {group.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">
                      {RELATION_LABEL[m.relation]}
                      {m.birth_year ? ` · *${m.birth_year}` : ""}
                      {m.death_year ? ` †${m.death_year}` : ""}
                    </p>
                  </div>
                  <button onClick={() => remove(m.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-stone-200 pt-5 space-y-3">
        <p className="text-sm font-medium text-gray-700">Familienmitglied hinzufügen</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <Label className="text-xs">Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vollständiger Name" className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Beziehung</Label>
            <select
              value={form.relation}
              onChange={(e) => setForm((p) => ({ ...p, relation: e.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {Object.entries(RELATION_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Geburtsjahr</Label>
            <Input value={form.birth_year} onChange={(e) => setForm((p) => ({ ...p, birth_year: e.target.value }))} placeholder="z.B. 1945" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Todesjahr</Label>
            <Input value={form.death_year} onChange={(e) => setForm((p) => ({ ...p, death_year: e.target.value }))} placeholder="z.B. 2010" className="mt-1" />
          </div>
        </div>
        <Button
          onClick={add}
          disabled={adding || !form.name}
          className="rounded-xl text-white"
          style={{ background: "#b45309" }}
        >
          <Plus className="w-4 h-4 mr-1" /> Hinzufügen
        </Button>
      </div>
    </div>
  );
}