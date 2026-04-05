import { format } from "date-fns";
import { de } from "date-fns/locale";

function fmt(d) {
  try { return format(new Date(d), "d. MMMM yyyy", { locale: de }); }
  catch { return d || ""; }
}

function BookPage({ children, className = "", pageNumber }) {
  return (
    <div className={`relative bg-white shadow-lg rounded-sm overflow-hidden ${className}`}
      style={{ aspectRatio: "210/297", border: "1px solid #e7e5e4" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #c9a96e, #e4c99a, #c9a96e)" }} />
      {children}
      {pageNumber && (
        <p className="absolute bottom-2 left-0 right-0 text-center" style={{ color: "#d1c4a8", fontSize: "0.45rem", letterSpacing: "0.1em" }}>
          — {pageNumber} —
        </p>
      )}
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="mb-2.5">
      <p className="text-center uppercase tracking-widest" style={{ color: "#c9a96e", fontSize: "0.48rem", letterSpacing: "0.2em" }}>{label}</p>
      <div className="h-px mx-auto mt-1" style={{ width: 36, background: "linear-gradient(90deg, transparent, #c9a96e, transparent)" }} />
    </div>
  );
}

function CoverPage({ memorial }) {
  return (
    <BookPage>
      <div className="flex flex-col h-full">
        {memorial.hero_image_url ? (
          <div className="flex-1 overflow-hidden">
            <img src={memorial.hero_image_url} alt="" className="w-full h-full object-cover object-face"
              style={{ filter: "brightness(0.85) sepia(0.1)" }} />
          </div>
        ) : (
          <div className="flex-1" style={{ background: "linear-gradient(160deg, #2d1f0a, #1a1410)" }} />
        )}
        <div className="p-3.5 text-center" style={{ background: "#fafaf8" }}>
          <div className="h-px mb-2 mx-4" style={{ background: "linear-gradient(90deg, transparent, #c9a96e, transparent)" }} />
          <h2 className="font-semibold text-gray-800 leading-tight mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem" }}>
            {memorial.name}
          </h2>
          {(memorial.birth_date || memorial.death_date) && (
            <p style={{ fontSize: "0.48rem", color: "#8a8278" }}>
              {memorial.birth_date ? fmt(memorial.birth_date) : "?"} — {memorial.death_date ? fmt(memorial.death_date) : "?"}
            </p>
          )}
          {memorial.subtitle && (
            <p className="italic mt-0.5" style={{ color: "#a07830", fontSize: "0.45rem" }}>„{memorial.subtitle}"</p>
          )}
          <div className="h-px mt-2 mx-4" style={{ background: "linear-gradient(90deg, transparent, #c9a96e, transparent)" }} />
          <p className="mt-1" style={{ color: "#c9a96e", fontSize: "0.38rem", letterSpacing: "0.2em" }}>EVERTRACE · ERINNERUNGSBUCH</p>
        </div>
      </div>
    </BookPage>
  );
}

function TableOfContents({ sections }) {
  const visible = sections.filter(s => s.show);
  if (visible.length < 3) return null;
  return (
    <BookPage pageNumber={1}>
      <div className="p-4 h-full flex flex-col">
        <SectionHeader label="Inhalt" />
        <div className="flex-1 flex flex-col justify-center space-y-1.5">
          {visible.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-gray-700" style={{ fontSize: "0.48rem", fontFamily: "'Cormorant Garamond', serif" }}>{s.label}</span>
              <div className="flex-1 border-b border-dotted border-stone-300" />
              <span style={{ fontSize: "0.38rem", color: "#c9a96e" }}>{s.page}</span>
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  );
}

function BiographyPages({ memorial }) {
  if (!memorial.biography) return null;
  const text = memorial.biography;
  const chunkSize = 520;
  const chunks = [];
  for (let i = 0; i < text.length;) {
    let end = Math.min(i + chunkSize, text.length);
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(". ", end);
      if (lastPeriod > i + chunkSize * 0.6) end = lastPeriod + 2;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks.map((chunk, idx) => (
    <BookPage key={`bio-${idx}`} pageNumber={2 + idx}>
      <div className="p-4 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Lebensgeschichte" />}
        {idx === 0 && (
          <h3 className="font-semibold text-gray-800 mb-1.5 leading-snug" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem" }}>
            {memorial.name}
          </h3>
        )}
        {idx === 0 && <div className="h-px mb-2.5" style={{ background: "linear-gradient(90deg, #c9a96e, transparent)" }} />}
        <p className="text-gray-600 flex-1 overflow-hidden" style={{ fontSize: "0.5rem", lineHeight: 1.75, fontFamily: "'Cormorant Garamond', serif" }}>
          {chunk}
        </p>
      </div>
    </BookPage>
  ));
}

function TimelinePages({ timeline }) {
  if (!timeline?.length) return null;
  const pages = [];
  for (let i = 0; i < timeline.length; i += 4) pages.push(timeline.slice(i, i + 4));
  return pages.map((events, idx) => (
    <BookPage key={`tl-${idx}`} pageNumber={10 + idx}>
      <div className="p-4 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Stationen des Lebens" />}
        <div className="flex-1 space-y-2.5 overflow-hidden">
          {events.map((ev) => (
            <div key={ev.id} className="flex gap-2">
              <div className="flex-shrink-0 w-8 text-right pt-0.5">
                <p className="font-bold" style={{ fontSize: "0.5rem", color: "#c9a96e" }}>{ev.year}</p>
              </div>
              <div className="flex-shrink-0 w-px self-stretch mt-0.5 mb-0.5" style={{ background: "#e4c99a" }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 leading-tight" style={{ fontSize: "0.5rem" }}>{ev.title}</p>
                {ev.description && (
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.42rem", lineHeight: 1.5 }}>
                    {ev.description.slice(0, 120)}{ev.description.length > 120 ? "…" : ""}
                  </p>
                )}
              </div>
              {ev.image_url && (
                <img src={ev.image_url} alt="" className="w-8 h-8 rounded object-cover object-face flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  ));
}

function LegacyPage({ entries }) {
  if (!entries?.length) return null;
  return (
    <BookPage pageNumber={20}>
      <div className="p-4 h-full flex flex-col">
        <SectionHeader label="Lebenswerk & Werte" />
        <div className="flex-1 space-y-2 overflow-hidden">
          {entries.slice(0, 7).map((entry) => (
            <div key={entry.id} className="border-l-2 pl-2" style={{ borderColor: "#e4c99a" }}>
              <p className="font-semibold text-gray-800" style={{ fontSize: "0.5rem" }}>{entry.title}</p>
              {entry.description && (
                <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.42rem", lineHeight: 1.5 }}>
                  {entry.description.slice(0, 110)}{entry.description.length > 110 ? "…" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  );
}

function GalleryPages({ images }) {
  if (!images?.length) return null;
  const pages = [];
  for (let i = 0; i < images.length; i += 4) pages.push(images.slice(i, i + 4));
  return pages.map((imgs, idx) => (
    <BookPage key={`gal-${idx}`} pageNumber={30 + idx}>
      <div className="p-3 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Erinnerungen in Bildern" />}
        <div className="grid grid-cols-2 gap-1 flex-1">
          {imgs.map((url, i) => (
            <div key={i} className="rounded overflow-hidden bg-stone-100">
              <img src={url} alt="" className="w-full h-full object-cover object-face" style={{ filter: "sepia(0.06)" }} />
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  ));
}

function MemoryWallPages({ entries }) {
  if (!entries?.length) return null;
  const pages = [];
  for (let i = 0; i < entries.length; i += 3) pages.push(entries.slice(i, i + 3));
  return pages.map((chunk, idx) => (
    <BookPage key={`mw-${idx}`} pageNumber={40 + idx}>
      <div className="p-4 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Erinnerungswand" />}
        <div className="flex-1 space-y-3 overflow-hidden">
          {chunk.map((entry) => (
            <div key={entry.id}>
              <p className="text-gray-600 italic" style={{ fontSize: "0.48rem", lineHeight: 1.6 }}>
                „{entry.message.slice(0, 190)}{entry.message.length > 190 ? "…" : ""}"
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #c9a96e, #a07840)" }} />
                <p style={{ fontSize: "0.42rem", color: "#6b7280" }}>
                  <strong>{entry.author_name}</strong>{entry.relation ? ` · ${entry.relation}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  ));
}

function BlogPages({ posts }) {
  if (!posts?.length) return null;
  return posts.slice(0, 4).map((post, idx) => (
    <BookPage key={`blog-${idx}`} pageNumber={50 + idx}>
      <div className="p-4 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Briefe & Gedanken" />}
        <h4 className="font-semibold text-gray-800 mb-0.5 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.58rem" }}>
          {post.title}
        </h4>
        <p className="mb-2" style={{ fontSize: "0.38rem", color: "#8a8278" }}>{fmt(post.created_date)}</p>
        <div className="h-px mb-2" style={{ background: "#e4c99a" }} />
        <p className="text-gray-600 italic flex-1 overflow-hidden" style={{ fontSize: "0.46rem", lineHeight: 1.65, fontFamily: "'Cormorant Garamond', serif" }}>
          {post.content.slice(0, 460)}{post.content.length > 460 ? "…" : ""}
        </p>
      </div>
    </BookPage>
  ));
}

function CondolencePages({ condolences }) {
  if (!condolences?.length) return null;
  const pages = [];
  for (let i = 0; i < condolences.length; i += 3) pages.push(condolences.slice(i, i + 3));
  return pages.map((chunk, idx) => (
    <BookPage key={`cond-${idx}`} pageNumber={60 + idx}>
      <div className="p-4 h-full flex flex-col">
        {idx === 0 && <SectionHeader label="Worte des Gedenkens" />}
        <div className="flex-1 space-y-3 overflow-hidden">
          {chunk.map((e) => (
            <div key={e.id} className="border-l-2 pl-2.5" style={{ borderColor: "#e4c99a" }}>
              <p className="text-gray-600 italic" style={{ fontSize: "0.48rem", lineHeight: 1.6 }}>
                „{e.message.slice(0, 210)}{e.message.length > 210 ? "…" : ""}"
              </p>
              <p className="font-semibold text-gray-700 mt-0.5" style={{ fontSize: "0.42rem" }}>— {e.author_name}</p>
            </div>
          ))}
        </div>
      </div>
    </BookPage>
  ));
}

function CandlePage({ candles }) {
  if (!candles?.length) return null;
  return (
    <BookPage pageNumber={70}>
      <div className="p-4 h-full flex flex-col">
        <SectionHeader label="Virtuelle Kerzen" />
        <p className="text-center text-gray-500 mb-2.5" style={{ fontSize: "0.46rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          {candles.length} {candles.length === 1 ? "Kerze wurde" : "Kerzen wurden"} zum Gedenken entzündet
        </p>
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-wrap gap-x-2.5 gap-y-1">
            {candles.slice(0, 40).map((c, i) => (
              <span key={c.id || i} style={{ fontSize: "0.4rem", color: "#8a8278" }}>🕯 {c.lighter_name}</span>
            ))}
            {candles.length > 40 && (
              <span style={{ fontSize: "0.4rem", color: "#b0a898" }}>… und {candles.length - 40} weitere</span>
            )}
          </div>
        </div>
      </div>
    </BookPage>
  );
}

function BackCover({ memorial }) {
  return (
    <BookPage>
      <div className="h-full flex flex-col items-center justify-center p-5 text-center"
        style={{ background: "linear-gradient(160deg, #1a1410, #2d1f0a)" }}>
        <div className="h-px w-10 mb-3" style={{ background: "#c9a96e" }} />
        <p className="text-white font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.68rem" }}>
          {memorial.name}
        </p>
        {memorial.death_date && (
          <p className="mt-0.5" style={{ fontSize: "0.42rem", color: "#6b6257" }}>† {fmt(memorial.death_date)}</p>
        )}
        <div className="h-px w-10 mt-3 mb-2" style={{ background: "#c9a96e" }} />
        <p style={{ color: "#c9a96e", fontSize: "0.38rem", letterSpacing: "0.2em" }}>EVERTRACE</p>
        <p className="mt-2 leading-relaxed" style={{ fontSize: "0.34rem", color: "#4a4035" }}>
          Dieses Buch wurde mit Liebe zusammengestellt<br />
          aus den Erinnerungen, Fotos und Worten derer,<br />
          die {memorial.name} kannten und liebten.
        </p>
      </div>
    </BookPage>
  );
}

export default function BookPreview({
  memorial, condolences = [], selectedImages = [],
  timeline = [], legacyEntries = [], memoryWallEntries = [],
  blogPosts = [], candles = []
}) {
  const approved = condolences.filter(c => c.status === "approved" || !c.status);

  const sections = [
    { label: "Lebensgeschichte", page: 2, show: !!memorial.biography },
    { label: "Stationen des Lebens", page: 10, show: timeline.length > 0 },
    { label: "Lebenswerk & Werte", page: 20, show: legacyEntries.length > 0 },
    { label: "Erinnerungen in Bildern", page: 30, show: selectedImages.length > 0 },
    { label: "Erinnerungswand", page: 40, show: memoryWallEntries.length > 0 },
    { label: "Briefe & Gedanken", page: 50, show: blogPosts.length > 0 },
    { label: "Worte des Gedenkens", page: 60, show: approved.length > 0 },
    { label: "Virtuelle Kerzen", page: 70, show: candles.length > 0 },
  ];

  const bioPages = memorial.biography ? Math.ceil(memorial.biography.length / 520) : 0;
  const totalPages = 2 + bioPages
    + Math.ceil(timeline.length / 4)
    + (legacyEntries.length > 0 ? 1 : 0)
    + Math.ceil(selectedImages.length / 4)
    + Math.ceil(memoryWallEntries.length / 3)
    + Math.min(blogPosts.length, 4)
    + Math.ceil(approved.length / 3)
    + (candles.length > 0 ? 1 : 0) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">Buchvorschau · ca. {totalPages} Seiten</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {timeline.length > 0 && <span>{timeline.length} Stationen</span>}
          {selectedImages.length > 0 && <span>{selectedImages.length} Fotos</span>}
          {approved.length > 0 && <span>{approved.length} Kondolenzen</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <CoverPage memorial={memorial} />
        <TableOfContents sections={sections} />
        <BiographyPages memorial={memorial} />
        <TimelinePages timeline={timeline} />
        <LegacyPage entries={legacyEntries} />
        <GalleryPages images={selectedImages} />
        <MemoryWallPages entries={memoryWallEntries} />
        <BlogPages posts={blogPosts} />
        <CondolencePages condolences={approved} />
        <CandlePage candles={candles} />
        <BackCover memorial={memorial} />
      </div>
    </div>
  );
}