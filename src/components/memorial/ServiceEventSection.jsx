import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, ExternalLink, Users, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EVENT_TYPE_LABELS = {
  trauerfeier: "Trauerfeier",
  beerdigung:  "Beerdigung",
  jahrestag:   "Jahrestag",
  gedenken:    "Gedenkfeier",
  messe:       "Gedenkgottesdienst",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function ServiceEventSection({ events }) {
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", guest_count: 1, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});

  if (!events?.length) return null;

  const setF = (k, v) => setRsvpForm(p => ({ ...p, [k]: v }));

  const submitRsvp = async () => {
    if (!rsvpForm.name) return;
    setSubmitting(true);
    await base44.entities.MemorialRSVP.create({
      event_id: rsvpEvent.id,
      memorial_id: rsvpEvent.memorial_id,
      ...rsvpForm,
    });
    setSubmitted(p => ({ ...p, [rsvpEvent.id]: true }));
    setRsvpEvent(null);
    setRsvpForm({ name: "", email: "", guest_count: 1, message: "" });
    setSubmitting(false);
  };

  return (
    <section className="py-16 px-6" style={{ background: "#1a1410" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a84c" }}>Veranstaltungen</p>
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "#e5d5c0" }}>
            Trauerfeier & Gedenken
          </h2>
        </div>

        <div className="space-y-5">
          {events.map(event => (
            <div key={event.id} className="rounded-2xl p-6 border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(201,168,76,0.2)" }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full inline-block mb-3"
                    style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </span>
                  <h3 className="font-semibold text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#e5d5c0" }}>
                    {event.title}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#a09080" }}>
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#c9a84c" }} />
                      <span>{formatDate(event.date)}{event.time && ` · ${event.time} Uhr`}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#a09080" }}>
                        <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#c9a84c" }} />
                        <span>{event.location}{event.address && `, ${event.address}`}</span>
                      </div>
                    )}
                    {event.livestream_url && (
                      <a href={event.livestream_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:underline" style={{ color: "#c9a84c" }}>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        Live-Stream ansehen
                      </a>
                    )}
                    {event.notes && <p className="text-sm mt-2" style={{ color: "#a09080" }}>{event.notes}</p>}
                  </div>
                </div>
                {event.rsvp_enabled && (
                  <div className="flex-shrink-0">
                    {submitted[event.id] ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ background: "rgba(6,95,70,0.3)", color: "#6ee7b7" }}>
                        <Check className="w-4 h-4" /> Angemeldet
                      </div>
                    ) : (
                      <Button onClick={() => setRsvpEvent(event)} className="text-white rounded-xl" style={{ background: "#b45309" }}>
                        <Users className="w-4 h-4 mr-2" /> Anmelden
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {rsvpEvent?.id === event.id && (
                <div className="mt-5 pt-5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium" style={{ color: "#e5d5c0" }}>Anmeldung zur Veranstaltung</h4>
                    <button onClick={() => setRsvpEvent(null)} style={{ color: "#a09080" }}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#a09080" }}>Name *</label>
                      <Input value={rsvpForm.name} onChange={e => setF("name", e.target.value)} placeholder="Ihr Name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-stone-600" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#a09080" }}>E-Mail</label>
                      <Input type="email" value={rsvpForm.email} onChange={e => setF("email", e.target.value)} placeholder="ihre@email.de"
                        className="bg-white/5 border-white/10 text-white placeholder:text-stone-600" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#a09080" }}>Anzahl Personen</label>
                      <Input type="number" min={1} max={20} value={rsvpForm.guest_count} onChange={e => setF("guest_count", parseInt(e.target.value))}
                        className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#a09080" }}>Nachricht (optional)</label>
                      <Input value={rsvpForm.message} onChange={e => setF("message", e.target.value)} placeholder="Kurze Nachricht..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-stone-600" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={submitRsvp} disabled={submitting || !rsvpForm.name} className="text-white rounded-xl" style={{ background: "#b45309" }}>
                      {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Jetzt anmelden
                    </Button>
                    <Button variant="outline" onClick={() => setRsvpEvent(null)} className="rounded-xl border-white/10 text-stone-400">
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}