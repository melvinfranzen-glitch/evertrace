import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Loader2, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EVENT_TYPES = [
  { value: "trauerfeier", label: "Trauerfeier" },
  { value: "beerdigung",  label: "Beerdigung" },
  { value: "jahrestag",   label: "Jahrestag" },
  { value: "gedenken",    label: "Gedenkfeier" },
  { value: "messe",       label: "Gedenkgottesdienst" },
];

const EMPTY_FORM = {
  event_type: "trauerfeier", title: "", date: "", time: "",
  location: "", address: "", livestream_url: "", notes: "", rsvp_enabled: false,
};

export default function ServiceEventEditor({ memorialId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedRsvp, setExpandedRsvp] = useState(null);
  const [rsvpData, setRsvpData] = useState({});

  useEffect(() => {
    base44.entities.MemorialServiceEvent.filter({ memorial_id: memorialId }, "date").then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, [memorialId]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    const event = await base44.entities.MemorialServiceEvent.create({ ...form, memorial_id: memorialId });
    setEvents(p => [...p, event]);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.MemorialServiceEvent.delete(id);
    setEvents(p => p.filter(e => e.id !== id));
  };

  const loadRsvps = async (eventId) => {
    if (expandedRsvp === eventId) { setExpandedRsvp(null); return; }
    const rsvps = await base44.entities.MemorialRSVP.filter({ event_id: eventId }, "-created_date");
    setRsvpData(p => ({ ...p, [eventId]: rsvps }));
    setExpandedRsvp(eventId);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-700" /></div>;

  return (
    <div className="space-y-6">
      <div className="border border-stone-200 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-700 text-sm">Neue Veranstaltung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Typ</Label>
            <select value={form.event_type} onChange={e => setF("event_type", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Titel *</Label>
            <Input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="z.B. Trauerfeier für..." className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Datum *</Label>
            <Input type="date" value={form.date} onChange={e => setF("date", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Uhrzeit</Label>
            <Input type="time" value={form.time} onChange={e => setF("time", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Ort / Kirche</Label>
            <Input value={form.location} onChange={e => setF("location", e.target.value)} placeholder="z.B. Kirche St. Maria" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Adresse</Label>
            <Input value={form.address} onChange={e => setF("address", e.target.value)} placeholder="Straße, Stadt" className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Live-Stream URL</Label>
          <Input value={form.livestream_url} onChange={e => setF("livestream_url", e.target.value)} placeholder="https://..." className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Hinweise für Gäste</Label>
          <Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} className="mt-1 h-16 resize-none" placeholder="Parkhinweise, Dresscode, etc." />
        </div>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setF("rsvp_enabled", !form.rsvp_enabled)}>
          <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{ borderColor: form.rsvp_enabled ? "#c9a96e" : "#d1d5db", background: form.rsvp_enabled ? "#c9a96e" : "white" }}>
            {form.rsvp_enabled && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-sm text-gray-700">RSVP / Anmeldung für Gäste aktivieren</span>
        </div>
        <Button onClick={add} disabled={saving || !form.title || !form.date} size="sm" className="rounded-xl" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
          Veranstaltung hinzufügen
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Noch keine Veranstaltungen</p>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="rounded-xl border border-stone-100 bg-stone-50 overflow-hidden">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#c9a96e" }}>
                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                  </span>
                  <p className="font-medium text-gray-800 text-sm mt-0.5">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {event.date}{event.time && ` · ${event.time} Uhr`}
                    {event.location && ` · ${event.location}`}
                  </p>
                  {event.rsvp_enabled && (
                    <button onClick={() => loadRsvps(event.id)}
                      className="flex items-center gap-1 text-xs mt-1.5 font-medium transition-colors" style={{ color: "#c9a96e" }}>
                      <Users className="w-3 h-3" />
                      Anmeldungen anzeigen
                      {expandedRsvp === event.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <button onClick={() => remove(event.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expandedRsvp === event.id && rsvpData[event.id] && (
                <div className="px-4 pb-4 border-t border-stone-200 pt-3">
                  {rsvpData[event.id].length === 0 ? (
                    <p className="text-xs text-gray-400">Noch keine Anmeldungen</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">{rsvpData[event.id].length} Anmeldung(en)</p>
                      {rsvpData[event.id].map(r => (
                        <div key={r.id} className="text-xs text-gray-600 flex gap-3">
                          <span className="font-medium">{r.name}</span>
                          {r.guest_count > 1 && <span className="text-gray-400">{r.guest_count} Personen</span>}
                          {r.email && <span className="text-gray-400">{r.email}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}