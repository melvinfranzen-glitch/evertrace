import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, ArrowLeft, BookOpen, Eye, ShoppingCart, Image, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookPreview from "@/components/memorial/BookPreview";
import PodOrderForm from "@/components/memorial/PodOrderForm";

const TABS = [
  { id: "preview", label: "Buchvorschau", icon: Eye },
  { id: "photos", label: "Fotos auswählen", icon: Image },
  { id: "order", label: "Bestellen", icon: ShoppingCart },
];

export default function MemoryBook() {
  const [memorial, setMemorial] = useState(null);
  const [condolences, setCondolences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = createPageUrl("Dashboard"); return; }
    Promise.all([
      base44.entities.Memorial.filter({ id }),
      base44.entities.CondolenceEntry.filter({ memorial_id: id, status: "approved" }, "-created_date"),
    ]).then(([memorials, condos]) => {
      if (memorials.length) {
        const m = memorials[0];
        setMemorial(m);
        setSelectedImages(m.gallery_images || []);
      }
      setCondolences(condos);
      setLoading(false);
    });
  }, []);

  const toggleImage = (url) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
    </div>
  );

  if (!memorial) return null;

  const allPhotos = memorial.gallery_images || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = createPageUrl("EditMemorial") + `?id=${memorial.id}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Erinnerungsbuch
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{memorial.name}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white shadow-sm">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span className="text-xs text-gray-600">
              <strong className="text-gray-800">{condolences.length}</strong> Kondolenzen ·{" "}
              <strong className="text-gray-800">{selectedImages.length}</strong> Fotos
            </span>
          </div>
        </div>

        {/* Intro banner */}
        <div
          className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-5"
          style={{ background: "linear-gradient(135deg, #1a1410, #2d1f0a)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,168,76,0.12)", border: "1.5px solid rgba(201,168,76,0.25)" }}>
            <BookOpen className="w-7 h-7" style={{ color: "#c9a84c" }} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ein bleibendes Buch der Erinnerung
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xl">
              Alle Kondolenzen, Fotos und die Lebensgeschichte werden zu einem hochwertigen, druckfertigen Buch zusammengefügt.
              Wählen Sie Ihr Format und bestellen Sie direkt — gedruckt und geliefert in Deutschland.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-stone-200 shadow-sm w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === id ? "#b45309" : "transparent",
                color: activeTab === id ? "white" : "#6b7280",
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* TAB: Preview */}
        {activeTab === "preview" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Buchvorschau
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">So sieht Ihr gedrucktes Buch aus</p>
              </div>
              <Button
                size="sm"
                className="rounded-xl text-white"
                style={{ background: "#b45309" }}
                onClick={() => setActiveTab("order")}
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" /> Jetzt bestellen
              </Button>
            </div>
            <BookPreview memorial={memorial} condolences={condolences} selectedImages={selectedImages} />
          </div>
        )}

        {/* TAB: Photos */}
        {activeTab === "photos" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Fotos für das Buch auswählen
              </h3>
              <p className="text-sm text-gray-500">
                {selectedImages.length} von {allPhotos.length} Fotos ausgewählt
              </p>
            </div>

            {allPhotos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Image className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Keine Fotos in der Galerie. Laden Sie zuerst Bilder hoch.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl"
                  onClick={() => window.location.href = createPageUrl("EditMemorial") + `?id=${memorial.id}`}
                >
                  Zur Galerie
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {allPhotos.map((url) => {
                    const selected = selectedImages.includes(url);
                    return (
                      <div
                        key={url}
                        onClick={() => toggleImage(url)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all"
                        style={{
                          border: selected ? "3px solid #c9a84c" : "3px solid transparent",
                          boxShadow: selected ? "0 0 0 1px #c9a84c" : "none",
                        }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow"
                            style={{ background: "#c9a84c" }}>
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedImages(selectedImages.length === allPhotos.length ? [] : [...allPhotos])}
                  >
                    {selectedImages.length === allPhotos.length ? "Alle abwählen" : "Alle auswählen"}
                  </button>
                  <Button
                    className="rounded-xl text-white"
                    style={{ background: "#b45309" }}
                    onClick={() => setActiveTab("preview")}
                  >
                    Vorschau ansehen →
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: Order */}
        {activeTab === "order" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Erinnerungsbuch bestellen
              </h3>
              <p className="text-sm text-gray-500">Wählen Sie Format und Lieferadresse</p>
            </div>
            <PodOrderForm
              memorial={memorial}
              condolenceCount={condolences.length}
              photoCount={selectedImages.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}