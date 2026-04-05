import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Lock } from "lucide-react";
import { parseSpotifyUrl } from "@/utils/spotify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CURATED_TRACKS } from "@/components/memorial/curatedTracksData";
import HeroSection from "@/components/memorial/HeroSection";
import TimelineSection from "@/components/memorial/TimelineSection";
import CondolenceBook from "@/components/memorial/CondolenceBook";
import VirtualCandleSection from "@/components/memorial/VirtualCandleSection";
import GallerySection from "@/components/memorial/GallerySection";
import BlogSection from "@/components/memorial/BlogSection";
import FamilyTreeSection from "@/components/memorial/FamilyTreeSection";
import AudioSection from "@/components/memorial/AudioSection";
import MemoryWallSection from "@/components/memorial/MemoryWallSection";
import LegacySection from "@/components/memorial/LegacySection";
import ServiceEventSection from "@/components/memorial/ServiceEventSection";
import SectionDivider from "@/components/memorial/SectionDivider";
import FloatingMusicPlayer from "@/components/memorial/FloatingMusicPlayer";
import DonationSection from "@/components/memorial/DonationSection";
import ReportContentModal from "@/components/memorial/ReportContentModal";

export default function MemorialProfile() {
  const [memorial, setMemorial] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [familyUnlocked, setFamilyUnlocked] = useState(false);
  const [familyPwInput, setFamilyPwInput] = useState("");
  const [familyPwError, setFamilyPwError] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [condolences, setCondolences] = useState([]);
  const [candles, setCandles] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [memoryWall, setMemoryWall] = useState([]);
  const [legacyEntries, setLegacyEntries] = useState([]);
  const [serviceEvents, setServiceEvents] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null));
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
      const [t, c, k, b, a, w, l, s] = await Promise.all([
        base44.entities.TimelineEvent.filter({ memorial_id: id }, "sort_order"),
        base44.entities.CondolenceEntry.filter({ memorial_id: id, status: "approved" }, "-created_date"),
        base44.entities.Candle.filter({ memorial_id: id }, "-created_date"),
        base44.entities.MemorialBlogPost.filter({ memorial_id: id, is_published: true }, "-created_date"),
        base44.entities.MemorialAudio.filter({ memorial_id: id }, "created_date"),
        base44.entities.MemoryWallEntry.filter({ memorial_id: id, status: "approved" }, "-created_date"),
        base44.entities.LegacyEntry.filter({ memorial_id: id }, "sort_order"),
        base44.entities.MemorialServiceEvent.filter({ memorial_id: id }, "date"),
      ]);
      setTimeline(t);
      setCondolences(c);
      setCandles(k);
      setBlogPosts(b);
      setAudioTracks(a);
      setMemoryWall(w);
      setLegacyEntries(l);
      setServiceEvents(s);
    } catch (e) {
      // ignore
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await base44.functions.invoke('verifyMemorialPassword', {
        short_id: new URLSearchParams(window.location.search).get('id'),
        password: pwInput,
      });
      if (res.data?.valid) {
        setUnlocked(true);
        loadContent(memorial.id);
      } else {
        setAttempts((a) => a + 1);
        setPwError(true);
      }
    } catch {
      setAttempts((a) => a + 1);
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
          <h2 className="text-2xl font-semibold text-gray-600 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Gedenkseite nicht gefunden
          </h2>
          <p className="text-gray-400">Der Link ist möglicherweise abgelaufen oder ungültig.</p>
        </div>
      </div>
    );
  }

  if (memorial.is_private && !unlocked) {
    // Fix 4: Lockout after 3 failed attempts
    if (attempts >= 3) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
          <div className="text-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: "#fef3c7" }}>
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Zu viele Fehlversuche
            </h2>
            <p className="text-sm" style={{ color: "#5a554e", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
              Zu viele Fehlversuche. Bitte fordern Sie den Link erneut beim Absender an.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: "#fef3c7" }}>
            <Lock className="w-8 h-8 text-amber-700" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
          {pwError && <p className="text-red-500 text-xs mb-3">Falsches Passwort ({3 - attempts} Versuche verbleibend)</p>}
          <Button
            onClick={handleUnlock}
            className="w-full mt-3 text-white rounded-xl"
            style={{ background: "#c9a96e", color: "#0f0e0c" }}
          >
            Eintreten
          </Button>
          {/* Password verification is server-side via verifyMemorialPassword function */}
        </div>
      </div>
    );
  }

  // Section visibility helper
  const sv = memorial.section_visibility || {};
  const canShow = (key) => {
    const v = sv[key] || "public";
    if (v === "private") return false;
    if (v === "family") return familyUnlocked;
    return true;
  };
  const needsFamilyLock = Object.values(sv).includes("family") && !familyUnlocked;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAFAF8" }}>
      <HeroSection memorial={memorial} />

      {/* Family lock prompt */}
      {needsFamilyLock && (
        <div className="py-6 px-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-xl border px-5 py-3" style={{ background: "white", border: "1px solid #e8dfd0" }}>
            <span className="text-sm text-gray-600">Familienbereich:</span>
            <input type="password" value={familyPwInput} onChange={e => { setFamilyPwInput(e.target.value); setFamilyPwError(false); }}
              onKeyDown={async e => { if (e.key === "Enter") { const r = await base44.functions.invoke('verifyFamilyPassword', { memorial_id: memorial.id, password: familyPwInput }); if (r.data?.valid) { setFamilyUnlocked(true); } else { setFamilyPwError(true); } } }}
              placeholder="Familienpasswort" className="border rounded-lg px-3 py-1.5 text-sm outline-none" style={{ borderColor: familyPwError ? "#ef4444" : "#e5e7eb" }} />
            <button onClick={async () => { const r = await base44.functions.invoke('verifyFamilyPassword', { memorial_id: memorial.id, password: familyPwInput }); if (r.data?.valid) { setFamilyUnlocked(true); } else { setFamilyPwError(true); } }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: "#c9a96e", color: "#0f0e0c" }}>
              Entsperren
            </button>
            {familyPwError && <span className="text-xs text-red-500">Falsches Passwort</span>}
          </div>
        </div>
      )}

      {/* Biography */}
      {memorial.biography && canShow("biography") && (
        <>
          <section className="py-24 px-6" style={{ background: "white" }}>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Lebensgeschichte</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {memorial.name}
                </h2>
                <p className="text-gray-400 text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Eine Geschichte, die weiterlebt.
                </p>
              </div>
              <div className="text-gray-600 leading-9 text-lg whitespace-pre-wrap"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                {memorial.biography}
              </div>
            </div>
          </section>
          <SectionDivider quote={`\u201EDas Leben endet, wenn man aufh\u00F6rt zu tr\u00E4umen \u2014 die Erinnerung nie.\u201C`} />
        </>
      )}

      {memorial.gallery_images?.length > 0 && canShow("gallery") && (
        <>
          <GallerySection images={memorial.gallery_images} name={memorial.name} />
          <SectionDivider light />
        </>
      )}

      {serviceEvents.length > 0 && canShow("events") && (
        <>
          <ServiceEventSection events={serviceEvents} />
        </>
      )}

      {timeline.length > 0 && canShow("timeline") && (
        <>
          <TimelineSection events={timeline} />
          <SectionDivider quote={`\u201EJeder Moment mit ihm / ihr war ein Geschenk.\u201C`} />
        </>
      )}

      {legacyEntries.length > 0 && canShow("legacy") && (
        <>
          <LegacySection entries={legacyEntries} />
          <SectionDivider light />
        </>
      )}

      {canShow("family") && <FamilyTreeSection memorial={memorial} isOwner={user && user.id === memorial.created_by} />}

      <DonationSection memorial={memorial} />

      {canShow("audio") && <AudioSection tracks={audioTracks} curatedTracks={memorial.curated_track_ids ? CURATED_TRACKS.filter(t => memorial.curated_track_ids.includes(t.id)) : []} />}

      {blogPosts.length > 0 && (
        <>
          <BlogSection posts={blogPosts} />
          <SectionDivider light />
        </>
      )}

      {(() => {
        const spotify = parseSpotifyUrl(memorial.spotify_url);
        if (!spotify) return null;
        const embedHeight = spotify.type === 'track' ? 152 : 380;
        return (
          <section className="py-16 px-6" style={{ background: "#F5F0E8" }}>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#c9a96e" }}>Lieblingsmelodien</p>
              <h2 className="text-3xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Musik, die verbindet
              </h2>
              <p className="text-gray-400 text-sm mb-8 font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Songs, die {memorial.name} liebte — und die uns an ihn / sie erinnern.
              </p>
              <iframe
                src={`${spotify.embedUrl}?utm_source=generator&theme=0`}
                width="100%" height={embedHeight} frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-2xl shadow-md" title="Spotify Player"
              />
            </div>
          </section>
        );
      })()}

      <VirtualCandleSection
        memorialId={memorial.id}
        candles={candles}
        onNewCandle={(c) => setCandles((prev) => [c, ...prev])}
      />

      {canShow("memorywall") && <MemoryWallSection memorialId={memorial.id} entries={memoryWall} />}

      {canShow("condolences") && (
        <CondolenceBook
          memorialId={memorial.id}
          condolences={condolences}
        />
      )}

      {/* Report Content Button */}
      <div className="py-8 text-center">
        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs transition-colors"
          style={{ color: "#a09070", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a09070")}
        >
          Inhalt melden · Urheberrechtsverstoß anzeigen
        </button>
      </div>

      {/* Footer */}
      <div className="py-12 text-center border-t border-stone-100" style={{ background: "#1a1410" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8" style={{ background: "rgba(201,169,110,0.3)" }} />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z" fill="#c9a96e" opacity="0.5"/>
            <circle cx="12" cy="12" r="2.5" fill="#c9a96e"/>
          </svg>
          <div className="h-px w-8" style={{ background: "rgba(201,169,110,0.3)" }} />
        </div>
        <p className="text-sm" style={{ color: "#6b5a44", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          In liebevoller Erinnerung bewahrt mit{" "}
          <a href="https://evertrace.de" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "#c9a96e" }}>Evertrace</a>
        </p>
        <p className="text-xs mt-3" style={{ color: "#3a2f25", fontFamily: "'Lato', sans-serif" }}>
          Music: "Before You Go" –{" "}
          <a href="https://www.fiftysounds.com" target="_blank" rel="noopener noreferrer" style={{ color: "#5a4a38" }}>Music by fiftysounds.com</a>
        </p>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportContentModal
          memorialId={memorial.id}
          memorialName={memorial.name}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Background music player */}
      <audio
        id="bg-music"
        loop
        controls
        style={{ position: "fixed", bottom: 10, right: 10, opacity: 0.6, zIndex: 1000, height: 30 }}
      >
        <source src="https://fiftysounds.com/music/before-you-go.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}