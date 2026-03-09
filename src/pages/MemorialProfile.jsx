import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/memorial/HeroSection";
import TimelineSection from "@/components/memorial/TimelineSection";
import CondolenceBook from "@/components/memorial/CondolenceBook";
import VirtualCandleSection from "@/components/memorial/VirtualCandleSection";
import GallerySection from "@/components/memorial/GallerySection";
import BlogSection from "@/components/memorial/BlogSection";
import FamilyTreeSection from "@/components/memorial/FamilyTreeSection";
import AudioSection from "@/components/memorial/AudioSection";

export default function MemorialProfile() {
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [condolences, setCondolences] = useState([]);
  const [candles, setCandles] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setLoading(false); return; }
    load(id);
  }, []);

  const load = async (id) => {
    try {
      const results = await base44.entities.Memorial.filter({ short_id: id });
      if (results.length === 0) { setLoading(false); return; }
      const m = results[0];
      setMemorial(m);
      if (!m.is_private) await loadContent(m.id);
    } catch (e) {
      // ignore auth/network errors – show not-found instead of redirect
    }
    setLoading(false);
  };

  const loadContent = async (id) => {
    try {
      const [t, c, k, b, a] = await Promise.all([
        base44.entities.TimelineEvent.filter({ memorial_id: id }, "sort_order"),
        base44.entities.CondolenceEntry.filter({ memorial_id: id, status: "approved" }, "-created_date"),
        base44.entities.Candle.filter({ memorial_id: id }, "-created_date"),
        base44.entities.MemorialBlogPost.filter({ memorial_id: id, is_published: true }, "-created_date"),
        base44.entities.MemorialAudio.filter({ memorial_id: id }, "created_date"),
      ]);
      setTimeline(t);
      setCondolences(c);
      setCandles(k);
      setBlogPosts(b);
      setAudioTracks(a);
    } catch (e) {
      // ignore
    }
  };

  const handleUnlock = () => {
    if (pwInput === memorial.access_password) {
      setUnlocked(true);
      loadContent(memorial.id);
    } else {
      setPwError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: "#FAFAF8" }}>
        <div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Gedenkseite nicht gefunden
          </h2>
          <p className="text-gray-400">Der Link ist möglicherweise abgelaufen oder ungültig.</p>
        </div>
      </div>
    );
  }

  if (memorial.is_private && !unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: "#fef3c7" }}>
            <Lock className="w-8 h-8 text-amber-700" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Private Gedenkseite
          </h2>
          <p className="text-gray-500 mb-6 text-sm">Diese Gedenkseite ist nur mit Passwort zugänglich.</p>
          <Input
            type="password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Passwort eingeben"
            className={`rounded-xl mb-1 ${pwError ? "border-red-400" : ""}`}
          />
          {pwError && <p className="text-red-500 text-xs mb-3">Falsches Passwort</p>}
          <Button
            onClick={handleUnlock}
            className="w-full mt-3 text-white rounded-xl"
            style={{ background: "#b45309" }}
          >
            Eintreten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAF8" }}>
      <HeroSection memorial={memorial} />

      {/* Biography */}
      {memorial.biography && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Lebensgeschichte</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Biografie
              </h2>
            </div>
            <div className="text-gray-600 leading-8 text-lg whitespace-pre-wrap" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              {memorial.biography}
            </div>
          </div>
        </section>
      )}

      {memorial.gallery_images?.length > 0 && (
        <GallerySection images={memorial.gallery_images} name={memorial.name} />
      )}

      {timeline.length > 0 && <TimelineSection events={timeline} />}

      <FamilyTreeSection memorial={memorial} />

      <BlogSection posts={blogPosts} />

      {memorial.spotify_url && (
        <section className="py-16 px-6" style={{ background: "#F5F0E8" }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Musik</p>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lieblingslieder
            </h2>
            <iframe
              src={`https://open.spotify.com/embed/playlist/${memorial.spotify_url.split("/").pop().split("?")[0]}`}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-2xl shadow-md"
              title="Spotify Playlist"
            />
          </div>
        </section>
      )}

      <VirtualCandleSection
        memorialId={memorial.id}
        candles={candles}
        onNewCandle={(c) => setCandles((prev) => [c, ...prev])}
      />

      <CondolenceBook
        memorialId={memorial.id}
        condolences={condolences}
      />

      <div className="py-8 text-center border-t border-stone-200" style={{ background: "#FAFAF8" }}>
        <p className="text-sm text-gray-400">
          Diese Gedenkseite wurde liebevoll erstellt mit{" "}
          <a href="/" className="font-medium" style={{ color: "#b45309" }}>Evertrace</a>
        </p>
      </div>
    </div>
  );
}