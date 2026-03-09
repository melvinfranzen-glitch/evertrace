import { Eye, Edit, QrCode, Calendar, Trash2 } from "lucide-react";
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

export default function MemorialCard({ memorial, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Memorial.delete(memorial.id);
    onDelete(memorial.id);
  };
  const memorialUrl = `${window.location.origin}/MemorialProfile?id=${memorial.short_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(memorialUrl)}`;

  const formatDate = (d) => {
    if (!d) return "–";
    try { return format(new Date(d), "d. MMM yyyy", { locale: de }); } 
    catch { return d; }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-stone-100 overflow-hidden">
        {memorial.hero_image_url ? (
          <img src={memorial.hero_image_url} alt={memorial.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e7e0d4,#d6cfc5)" }}>
            <span className="text-5xl font-semibold text-stone-400" style={{ fontFamily: "'Playfair Display', serif" }}>
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

      <div className="p-5">
        <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            <img src={qrUrl} alt="QR" className="w-10 h-10 rounded" />
          )}
        </div>
      </div>
    </div>
  );
}