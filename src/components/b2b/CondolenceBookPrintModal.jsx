import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, BookOpen, Printer, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { B2B_BOOK_TIERS, getB2BBookUnitPrice, fmtEur } from "@/components/pricing/pricingData";

function fmtDate(d) {
  if (!d) return "";
  try { return format(new Date(d), "dd. MMMM yyyy", { locale: de }); }
  catch { return d; }
}

export default function CondolenceBookPrintModal({ page, caseData, contributions, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const unitPrice = getB2BBookUnitPrice(quantity);
  const totalBookPrice = unitPrice * quantity;

  const submit = async () => {
    setSubmitting(true);
    await base44.entities.PrintOrder.create({
      case_id: page.case_id,
      order_type: "Erinnerungsbuch",
      quantity,
      print_tier: "premium",
      unit_price: unitPrice,
      total_price: totalBookPrice,
      status: "In Bearbeitung",
    });
    setSubmitting(false);
    setDone(true);
  };

  const deceasedName = caseData
    ? `${caseData.deceased_first_name} ${caseData.deceased_last_name}`
    : "Verstorbene/r";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-2xl rounded-2xl max-h-[90vh] flex flex-col" style={{ background: "#181714", border: "1px solid #302d28" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#302d28" }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" style={{ color: "#c9a96e" }} />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>
              Gedenkbuch drucken
            </h2>
          </div>
          <button onClick={onClose} style={{ color: "#5a554e" }}><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
              <Check className="w-7 h-7" style={{ color: "#4ade80" }} />
            </div>
            <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>Bestellung aufgegeben</h3>
            <p className="text-sm mb-6" style={{ color: "#8a8278" }}>Das Gedenkbuch wird in Kürze produziert und an Ihre Lieferadresse gesendet.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>Schließen</button>
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Cover page */}
              <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg,#1c1917,#2c2010)", border: "1px solid rgba(201,169,110,0.3)" }}>
                <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>In liebevoller Erinnerung</p>
                <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f0ede8" }}>{deceasedName}</h3>
                {(caseData?.date_of_birth || caseData?.date_of_death) && (
                  <p className="text-sm" style={{ color: "#8a8278", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                    {caseData.date_of_birth && `* ${fmtDate(caseData.date_of_birth)}`}
                    {caseData.date_of_birth && caseData.date_of_death && " · "}
                    {caseData.date_of_death && `† ${fmtDate(caseData.date_of_death)}`}
                  </p>
                )}
                {page.biography && (
                  <p className="text-sm mt-4 italic leading-7" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#a09070" }}>
                    {page.biography.slice(0, 200)}{page.biography.length > 200 ? "…" : ""}
                  </p>
                )}
              </div>

              {/* Contribution pages */}
              {contributions.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#5a554e" }}>
                    {contributions.length} Erinnerungen & Beiträge
                  </p>
                  <div className="space-y-2">
                    {contributions.slice(0, 5).map(c => (
                      <div key={c.id} className="p-4 rounded-xl" style={{ background: "#201e1a", border: "1px solid #302d28" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                            {c.contributor_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: "#f0ede8" }}>{c.contributor_name}</p>
                            <p className="text-xs" style={{ color: "#5a554e" }}>{fmtDate(c.created_date)}</p>
                          </div>
                        </div>
                        <p className="text-xs italic" style={{ color: "#8a8278", fontFamily: "'Cormorant Garamond', serif" }}>„{c.message}"</p>
                      </div>
                    ))}
                    {contributions.length > 5 && (
                      <p className="text-xs text-center py-2" style={{ color: "#5a554e" }}>+ {contributions.length - 5} weitere Einträge im Buch</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: "#5a554e" }}>Noch keine Beiträge vorhanden — das Buch enthält nur die Titelseite.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between gap-4 flex-shrink-0" style={{ borderColor: "#302d28" }}>
              <div>
                <p className="text-xs mb-1" style={{ color: "#8a8278" }}>Anzahl Exemplare</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>−</button>
                  <span className="w-8 text-center font-semibold" style={{ color: "#f0ede8" }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#201e1a", border: "1px solid #302d28", color: "#f0ede8" }}>+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: "#5a554e" }}>€ 29,90 / Stk.</p>
                <p className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e" }}>
                  € {(29.90 * quantity).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <button onClick={submit} disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                Bestellen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}