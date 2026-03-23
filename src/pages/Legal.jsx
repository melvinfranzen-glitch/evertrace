import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, ArrowLeft } from "lucide-react";

const SECTIONS = {
  impressum: {
    label: "Impressum",
    content: (
      <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#4a3f35" }}>
        <div>
          <p className="font-semibold text-base mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1c1917" }}>Angaben gemäß § 5 TMG</p>
          <p>Evertrace GmbH<br />Musterstraße 12<br />80331 München<br />Deutschland</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Vertreten durch</p>
          <p>Max Mustermann (Geschäftsführer)</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Kontakt</p>
          <p>E-Mail: hallo@evertrace.de<br />Telefon: +49 89 123 456 789</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Handelsregister</p>
          <p>Amtsgericht München · HRB 123456<br />USt-IdNr.: DE 123 456 789</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</p>
          <p>Max Mustermann, Musterstraße 12, 80331 München</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Haftungsausschluss</p>
          <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
        </div>
      </div>
    ),
  },
  datenschutz: {
    label: "Datenschutz",
    content: (
      <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#4a3f35" }}>
        <div>
          <p className="font-semibold text-base mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1c1917" }}>Datenschutzerklärung gemäß DSGVO</p>
          <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Verantwortliche Stelle</p>
          <p>Evertrace GmbH, Musterstraße 12, 80331 München<br />E-Mail: datenschutz@evertrace.de</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Erhebung und Nutzung personenbezogener Daten</p>
          <p>Wir erheben personenbezogene Daten (Name, E-Mail, Fotos) nur soweit dies zur Bereitstellung unserer Dienste erforderlich ist. Ihre Daten werden ausschließlich auf Servern in Deutschland gespeichert und nicht ohne Ihre Einwilligung an Dritte weitergegeben.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Hosting & Infrastruktur</p>
          <p>Unsere Dienste werden auf zertifizierten deutschen Servern betrieben (ISO 27001). Alle Daten sind verschlüsselt (TLS 1.3) und werden regelmäßig gesichert.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Ihre Rechte</p>
          <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer gespeicherten Daten sowie das Recht auf Datenübertragbarkeit. Schreiben Sie uns hierzu an datenschutz@evertrace.de.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Cookies</p>
          <p>Wir verwenden ausschließlich technisch notwendige Cookies für den Betrieb der Plattform. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>Beschwerderecht</p>
          <p>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Zuständig ist der Bayerische Landesbeauftragte für den Datenschutz (BayLfD).</p>
        </div>
      </div>
    ),
  },
  agb: {
    label: "AGB",
    content: (
      <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#4a3f35" }}>
        <div>
          <p className="font-semibold text-base mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1c1917" }}>Allgemeine Geschäftsbedingungen</p>
          <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die über die Plattform Evertrace (evertrace.de) zwischen der Evertrace GmbH und ihren Nutzern geschlossen werden.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 1 Leistungsumfang</p>
          <p>Evertrace stellt eine digitale Plattform zur Erstellung und Verwaltung von Gedenkseiten sowie zur Bestellung physischer Erinnerungsprodukte bereit. Die Nutzung der Grundfunktionen ist kostenlos; Premium-Funktionen sind kostenpflichtig.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 2 Vertragsschluss</p>
          <p>Mit der Registrierung auf der Plattform kommt ein Nutzungsvertrag zustande. Bei Bestellung von Produkten (Plaketten, Bücher) kommt ein separater Kaufvertrag zustande, der mit Auftragsbestätigung per E-Mail wirksam wird.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 3 Preise & Zahlung</p>
          <p>Alle Preise sind Endpreise inkl. gesetzlicher MwSt. Die Zahlung erfolgt per Kreditkarte oder SEPA-Lastschrift. Physische Produkte werden erst nach Zahlungseingang gefertigt.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 4 Widerrufsrecht</p>
          <p>Bei digitalen Produkten (Gedenkseiten-Abonnements) besteht kein Widerrufsrecht nach Freischaltung. Bei physischen Produkten (Plaketten, Bücher), die personalisiert angefertigt werden, ist das Widerrufsrecht gemäß § 312g Abs. 2 Nr. 1 BGB ausgeschlossen.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 5 Pflichten der Nutzer</p>
          <p>Nutzer sind verpflichtet, ausschließlich Inhalte einzustellen, zu denen sie die erforderlichen Rechte besitzen. Die Veröffentlichung von Inhalten, die Rechte Dritter verletzen oder gesetzwidrig sind, ist untersagt.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 6 Haftung</p>
          <p>Evertrace haftet nicht für Schäden aus der Unterbrechung des Betriebs, dem Verlust von Daten oder aus der Nutzung der Plattform durch Dritte. Die Haftung für grobe Fahrlässigkeit und Vorsatz bleibt unberührt.</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "#1c1917" }}>§ 7 Anwendbares Recht</p>
          <p>Es gilt deutsches Recht. Gerichtsstand ist München.</p>
        </div>
      </div>
    ),
  },
};

export default function Legal() {
  const params = new URLSearchParams(window.location.search);
  const defaultSection = params.get("section") || "impressum";
  const [active, setActive] = useState(defaultSection);

  const section = SECTIONS[active] || SECTIONS.impressum;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#F7F3ED" }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #EAE0D0", background: "#FEFCF9" }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#B07B34", fontWeight: 400 }}>Evertrace</Link>
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
      </div>
    <div className="pt-8 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-8" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          <Link to={createPageUrl("Home")} className="hover:underline">Startseite</Link>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: "#B07B34" }}>Rechtliches</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 11, color: "#B07B34", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Rechtliches</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 36, color: "#2F2D2A" }}>
            {section.label}
          </h1>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1" style={{ whiteSpace: "nowrap" }}>
          {Object.entries(SECTIONS).map(([key, s]) => (
            <button key={key} onClick={() => setActive(key)}
              className="flex-shrink-0 transition-all"
              style={{
                background: active === key ? "rgba(176,123,52,0.1)" : "#FEFCF9",
                border: `1px solid ${active === key ? "rgba(176,123,52,0.35)" : "#EAE0D0"}`,
                color: active === key ? "#B07B34" : "#A89A8A",
                borderRadius: 24,
                padding: "7px 18px",
                fontSize: 13,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                cursor: "pointer",
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", borderRadius: 16, padding: 32 }}>
          {section.content}
        </div>

        {/* Footer note */}
        <p className="text-xs text-center mt-8" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
          Stand: März 2026 · Bei Fragen wenden Sie sich an{" "}
          <a href="mailto:hallo@evertrace.de" className="underline" style={{ color: "#B07B34" }}>hallo@evertrace.de</a>
        </p>
      </div>
    </div>
    </div>
  );
}