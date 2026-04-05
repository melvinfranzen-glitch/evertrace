import { Heart, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function DonationSection({ memorial }) {
  const [copied, setCopied] = useState(false);

  if (!memorial.donation_enabled || !memorial.donation_iban) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ibanDisplay = memorial.donation_iban?.replace(/(.{4})/g, "$1 ").trim() || "";

  return (
    <section className="py-16 md:py-20 px-4 md:px-6" style={{ background: "#FAF8F4" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(201,169,110,0.15)", border: "2px solid rgba(201,169,110,0.3)" }}>
            <Heart className="w-7 h-7" style={{ color: "#c9a96e" }} fill="#c9a96e" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Unterstützung</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Spendenkonto
          </h2>
          {memorial.donation_message && (
            <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto" style={{ fontFamily: "'Lato', sans-serif" }}>
              {memorial.donation_message}
            </p>
          )}
        </div>

        {/* Donation Card */}
        <div className="rounded-2xl p-8 md:p-10 shadow-lg" style={{ background: "white", border: "1px solid #e8dfd0" }}>
          {/* Account details */}
          <div className="space-y-5 mb-8">
            {memorial.donation_account_holder && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8a8278", letterSpacing: "0.15em" }}>
                  Kontoinhaber
                </p>
                <p className="text-lg font-semibold text-gray-800">{memorial.donation_account_holder}</p>
              </div>
            )}

            {memorial.donation_bank_name && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8a8278", letterSpacing: "0.15em" }}>
                  Bank
                </p>
                <p className="text-lg font-semibold text-gray-800">{memorial.donation_bank_name}</p>
              </div>
            )}

            {memorial.donation_iban && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8a8278", letterSpacing: "0.15em" }}>
                  IBAN
                </p>
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono px-4 py-3 rounded-lg bg-stone-50 text-gray-700 flex-1 tracking-wider"
                    style={{ fontFamily: "Courier, monospace", letterSpacing: "0.05em" }}>
                    {ibanDisplay}
                  </code>
                  <button
                    onClick={() => copyToClipboard(memorial.donation_iban)}
                    className="p-2.5 rounded-lg transition-all flex items-center justify-center flex-shrink-0"
                    style={{ background: copied ? "#dbeafe" : "#e7e2db", color: copied ? "#0284c7" : "#8a8278" }}
                    title="In die Zwischenablage kopieren"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {memorial.donation_bic && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8a8278", letterSpacing: "0.15em" }}>
                  BIC / SWIFT
                </p>
                <code className="text-sm font-mono px-4 py-3 rounded-lg bg-stone-50 text-gray-700 block tracking-wider"
                  style={{ fontFamily: "Courier, monospace", letterSpacing: "0.05em" }}>
                  {memorial.donation_bic}
                </code>
              </div>
            )}
          </div>

          {/* External fundraising link */}
          {memorial.donation_url && (
            <div className="border-t border-stone-200 pt-6">
              <a
                href={memorial.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium w-full md:w-auto transition-all"
                style={{ background: "#c9a96e", color: "#0f0e0c" }}
              >
                <ExternalLink className="w-4 h-4" /> Zur Fundraising-Seite
              </a>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#8a8278", fontFamily: "'Lato', sans-serif" }}>
            Die Bankdaten werden nur auf dieser Gedenkseite angezeigt. Spenden sind freiwillig und dienen oft zur Unterstützung der Familie oder zu Ehren des Verstorbenen.
          </p>
        </div>
      </div>
    </section>
  );
}