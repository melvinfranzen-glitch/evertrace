import { Eye, Edit, QrCode, Calendar, Trash2, X, Copy, Check, BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { useState } from "react";

const planColors = {
  free: "bg-gray-100 text-gray-600",
  classic: "bg-amber-100 text-amber-800",
  premium: "bg-purple-100 text-purple-800",
};

const statusColors = {
  draft: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-600",
};

const statusLabels = { draft: "Entwurf", active: "Aktiv", expired: "Abgelaufen" };
const planLabels = { free: "Free", classic: "Classic", premium: "Premium" };

export default function MemorialCard({ memorial, onDelete, onOpenPlaque }) {
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
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex flex-col">
      <div className="relative h-36 bg-stone-100 overflow-hidden">
        {memorial.hero_image_url ? (
          <img src={memorial.hero_image_url} alt={memorial.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e7e0d4,#d6cfc5)" }}>
            <span className="text-5xl font-semibold text-stone-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {memorial.name?.[0] || "?"}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <Badge className={`text-xs ${statusColors[memorial.status] || statusColors.draft}`}>
            {statusLabels[memorial.status] || "Entwurf"}
          </Badge>
          <Badge className={`text-xs ${planColors[memorial.plan] || planColors.free}`}>
            {planLabels[memorial.plan] || "Free"}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1">
        <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {memorial.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(memorial.birth_date)} – {formatDate(memorial.death_date)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="text-xs rounded-lg h-8"
              onClick={() => window.open(`/MemorialProfile?id=${memorial.short_id}`, "_blank")}
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Ansehen
            </Button>
            <Button
            size="sm"
            variant="outline"
            className="text-xs rounded-lg h-8"
            onClick={() => window.location.href = createPageUrl(`EditMemorial`) + `?id=${memorial.id}`}
            >
            <Edit className="w-3.5 h-3.5 mr-1" /> Bearbeiten
            </Button>
            <Button
            size="sm"
            variant="outline"
            className="text-xs rounded-lg h-8"
            style={{ borderColor: "rgba(201,169,110,0.4)", color: "#c9a96e" }}
            onClick={() => window.location.href = createPageUrl("Dashboard") + `?tab=book`}
            >
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Lebensbuch
            </Button>
            {!confirming ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs rounded-lg h-8 border-red-200 text-red-500 hover:bg-red-50"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <div className="flex gap-1 items-center">
                <span className="text-xs text-red-600 font-medium">Löschen?</span>
                <Button
                  size="sm"
                  className="text-xs rounded-lg h-7 bg-red-500 hover:bg-red-600 text-white px-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "..." : "Ja"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-lg h-7 px-2"
                  onClick={() => setConfirming(false)}
                >
                  Nein
                </Button>
              </div>
            )}
          </div>
          {memorial.short_id && (
            <button
              onClick={() => setQrOpen(true)}
              className="relative group rounded-lg overflow-hidden border border-stone-200 hover:border-amber-400 transition-colors"
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
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: "1px solid #f0ede8", background: "linear-gradient(135deg, #fdf9f3, #faf5ec)" }}>
        <div className="flex items-center gap-1.5">
          <BookOpen style={{ width: 14, height: 14, color: "#c9a96e", flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a8278" }}>Lebensgeschichten-Buch bestellen</span>
        </div>
        <button
          onClick={() => window.location.href = `/Dashboard?tab=book`}
          style={{ background: "transparent", border: "1px solid rgba(201,169,110,0.35)", color: "#c9a96e", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
          Ab € 39,–
        </button>
      </div>
      </div>
    </div>

      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setQrOpen(false)}>
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                QR-Code · {memorial.name}
              </p>
              <button onClick={() => setQrOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={qrLarge} className="w-64 h-64 rounded-lg" alt="QR-Code groß" />
            <p className="text-xs text-gray-400 text-center break-all">{memorialUrl}</p>
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