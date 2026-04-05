import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, AlertTriangle, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportContentModal({ memorialId, memorialName, onClose }) {
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_email: "",
    report_type: "urheberrecht",
    description: "",
    content_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.reporter_email || !form.description) return;
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "rechtliches@evertrace.de",
        subject: `[Meldung] ${
          form.report_type === "urheberrecht"
            ? "Urheberrechtsverstoß"
            : "Inhaltsmeldung"
        } — Gedenkseite ${memorialName}`,
        body: `Meldung eingegangen über die Gedenkseite "${memorialName}" (ID: ${memorialId})

Meldungstyp: ${
          form.report_type === "urheberrecht"
            ? "Urheberrechtsverstoß"
            : form.report_type === "unangemessen"
            ? "Unangemessener Inhalt"
            : "Sonstiges"
        }
Melder: ${form.reporter_name} (${form.reporter_email})
Betroffener Inhalt: ${form.content_url || "Nicht angegeben"}

Beschreibung:
${form.description}

---
Diese Meldung wurde über das Meldeformular auf evertrace.de gesendet.
Bitte innerhalb von 24 Stunden prüfen und reagieren.`,
      });
      setDone(true);
    } catch (err) {
      console.error("Report submit error:", err);
      alert(
        "Fehler beim Senden. Bitte kontaktieren Sie uns direkt unter rechtliches@evertrace.de"
      );
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,2,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: "#c9a96e" }} />
            <h3
              className="font-semibold text-gray-800"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Inhalt melden
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <Check className="w-10 h-10 mx-auto mb-3 text-green-600" />
            <p className="font-semibold text-gray-800 mb-1">
              Meldung eingegangen
            </p>
            <p className="text-sm text-gray-500">
              Wir prüfen Ihre Meldung innerhalb von 24 Stunden und informieren
              Sie per E-Mail über das Ergebnis.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                className="text-xs block mb-1.5"
                style={{ color: "#8a8278" }}
              >
                Art der Meldung
              </label>
              <div className="flex gap-2">
                {[
                  { id: "urheberrecht", label: "Urheberrechtsverstoß" },
                  { id: "unangemessen", label: "Unangemessener Inhalt" },
                  { id: "sonstiges", label: "Sonstiges" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => set("report_type", t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background:
                        form.report_type === t.id
                          ? "rgba(201,169,110,0.12)"
                          : "white",
                      border: `1px solid ${
                        form.report_type === t.id ? "#c9a96e" : "#e5e7eb"
                      }`,
                      color:
                        form.report_type === t.id ? "#c9a96e" : "#6b7280",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "#8a8278" }}
                >
                  Ihr Name
                </label>
                <Input
                  value={form.reporter_name}
                  onChange={(e) => set("reporter_name", e.target.value)}
                  placeholder="Max Mustermann"
                  className="rounded-xl text-sm"
                />
              </div>
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "#8a8278" }}
                >
                  Ihre E-Mail *
                </label>
                <Input
                  type="email"
                  value={form.reporter_email}
                  onChange={(e) => set("reporter_email", e.target.value)}
                  placeholder="max@beispiel.de"
                  className="rounded-xl text-sm"
                />
              </div>
            </div>

            {form.report_type === "urheberrecht" && (
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "#8a8278" }}
                >
                  Link zum betroffenen Inhalt (optional)
                </label>
                <Input
                  value={form.content_url}
                  onChange={(e) => set("content_url", e.target.value)}
                  placeholder="z.B. Link zum Original-Foto/-Song"
                  className="rounded-xl text-sm"
                />
              </div>
            )}

            <div>
              <label
                className="text-xs block mb-1"
                style={{ color: "#8a8278" }}
              >
                Beschreibung *
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={
                  form.report_type === "urheberrecht"
                    ? "Bitte beschreiben Sie, welcher Inhalt Ihre Rechte verletzt und belegen Sie Ihre Urheberschaft."
                    : "Bitte beschreiben Sie den gemeldeten Inhalt."
                }
                className="rounded-xl text-sm resize-none h-24"
              />
            </div>

            {form.report_type === "urheberrecht" && (
              <p className="text-xs leading-relaxed" style={{ color: "#8a8278" }}>
                Mit dem Absenden dieser Meldung bestätigen Sie, dass Sie der
                Inhaber der betreffenden Rechte sind oder im Auftrag des
                Rechteinhabers handeln. Falsche Angaben können rechtliche
                Konsequenzen haben.
              </p>
            )}

            <button
              onClick={submit}
              disabled={submitting || !form.reporter_email || !form.description}
              className="w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ background: "#c9a96e", color: "#0f0e0c" }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-1.5" />
              ) : null}
              Meldung absenden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}