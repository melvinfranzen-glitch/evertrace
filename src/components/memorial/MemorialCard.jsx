import { Eye, Edit, QrCode, Calendar, Trash2, X, Copy, Check, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

const statusColors = {
  draft: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-600",
};

const statusLabels = { draft: "Entwurf", active: "Aktiv", expired: "Abgelaufen" };
const planLabels = { free: "Free", classic: "Classic", premium: "Premium" };

export default function MemorialCard({ memorial, onDelete, onOpenPlaque }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Memorial.delete(memorial.id);
    onDelete(memorial.id);
  };
  const memorialUrl = `${window.location.origin}${createPageUrl("MemorialProfile")}?id=${memorial.short_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(memorialUrl)}`;
  const qrLarge = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(memorialUrl)}`;

  const formatDate = (d) => {
    if (!d) return "–";
    try { return format(new Date(d), "d. MMM yyyy", { locale: de }); }
    catch { return d; }
  };

  return (
    <div className="relative">
      <div className="rounded-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
        style={{ background: "#FEFCF9", border: "1px solid #EAE0D0", boxShadow: "0 4px 24px rgba(47,45,42,0.08)" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(47,45,42,0.12)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(47,45,42,0.08)"}
      >
        <div className="relative h-36 overflow-hidden" style={{ background: "#EDE3D3" }}>
          {memorial.hero_image_url ? (
            <img src={memorial.hero_image_url} alt={memorial.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${memorial.hero_image_position ?? 33}%` }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EDE3D3, #D8C3A5)" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: "#A89A8A" }}>
                {memorial.name?.[0] || "?"}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <Badge className={`text-xs ${statusColors[memorial.status] || statusColors.draft}`}>
              {statusLabels[memorial.status] || "Entwurf"}
            </Badge>
          </div>
        </div>

        <div className="p-5 flex-1">
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 20, color: "#2F2D2A", marginBottom: 6 }}>
            {memorial.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-4" style={{ color: "#A89A8A" }}>
            <Calendar className="w-3.5 h-3.5" />
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12 }}>{formatDate(memorial.birth_date)} – {formatDate(memorial.death_date)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap gap-y-2">
              <Button size="sm" variant="outline" className="text-xs rounded-lg h-8"
                onClick={() => window.open(`/MemorialProfile?id=${memorial.short_id}`, "_blank")}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Ansehen
              </Button>
              <Button size="sm" variant="outline" className="text-xs rounded-lg h-8"
                onClick={() => navigate(createPageUrl("EditMemorial") + `?id=${memorial.id}`)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> Bearbeiten
              </Button>
              <Button size="sm" variant="outline" className="text-xs rounded-lg h-8"
                style={{ borderColor: "rgba(176,123,52,0.4)", color: "#B07B34" }}
                onClick={() => navigate(createPageUrl("Dashboard") + "?tab=book")}>
                <BookOpen className="w-3.5 h-3.5 mr-1" /> Lebensbuch
              </Button>
              {!confirming ? (
                <Button size="sm" variant="outline" className="text-xs rounded-lg h-8 border-red-200 text-red-500 hover:bg-red-50"
                  onClick={() => setConfirming(true)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-red-600 font-medium">Löschen?</span>
                  <Button size="sm" className="text-xs rounded-lg h-7 bg-red-500 hover:bg-red-600 text-white px-2"
                    onClick={handleDelete} disabled={deleting}>
                    {deleting ? "..." : "Ja"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs rounded-lg h-7 px-2" onClick={() => setConfirming(false)}>
                    Nein
                  </Button>
                </div>
              )}
            </div>
            {memorial.short_id && (
              <button onClick={() => setQrOpen(true)}
                className="relative group rounded-lg overflow-hidden transition-colors"
                style={{ border: "1px solid #EAE0D0" }}
                title="Klicken zum Vergrößern"
              >
                <img src={qrUrl} alt="QR" className="w-10 h-10 block" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
              </button>
            )}
          </div>

          {/* Book upsell bar */}
          <div className="flex items-center justify-between px-4 py-2.5 mt-3 rounded-xl"
            style={{ borderTop: "1px solid #EAE0D0", background: "linear-gradient(to right, rgba(176,123,52,0.04), transparent)" }}>
            <div className="flex items-center gap-1.5">
              <BookOpen style={{ width: 14, height: 14, color: "#B07B34", flexShrink: 0 }} />
              <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 12, color: "#A89A8A" }}>Lebensgeschichten-Buch bestellen</span>
            </div>
            <button onClick={() => navigate("/Dashboard?tab=book")}
              style={{ background: "transparent", border: "1px solid rgba(176,123,52,0.35)", color: "#B07B34", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "'Lato', sans-serif", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 400 }}>
              Ab € 39,–
            </button>
          </div>
        </div>
      </div>

      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setQrOpen(false)}>
          <div className="rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 max-w-xs w-full"
            style={{ background: "#FEFCF9" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full">
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 16, color: "#2F2D2A" }}>
                QR-Code · {memorial.name}
              </p>
              <button onClick={() => setQrOpen(false)} style={{ color: "#A89A8A" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={qrLarge} className="w-64 h-64 rounded-lg" alt="QR-Code groß" />
            <p className="text-xs text-center break-all" style={{ color: "#A89A8A", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{memorialUrl}</p>
            <Button onClick={copyLink} variant="outline" size="sm" className="w-full rounded-xl gap-2">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopiert!" : "Link kopieren"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}