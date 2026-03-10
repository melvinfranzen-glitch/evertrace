import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Cake, Heart, BookOpen } from "lucide-react";

const occasionIcon = {
  geburtstag: <Cake className="w-4 h-4 text-amber-600" />,
  todestag:   <Heart className="w-4 h-4 text-rose-400" />,
  allgemein:  <BookOpen className="w-4 h-4 text-stone-400" />,
};

const occasionLabel = {
  geburtstag: "Zum Geburtstag",
  todestag:   "In stiller Erinnerung",
  allgemein:  "Gedanken",
};

export default function BlogSection({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-20 px-6" style={{ background: "white" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Briefe & Gedanken</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Worte, die weiterleben
          </h2>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            An besonderen Tagen geschrieben — für einen besonderen Menschen.
          </p>
        </div>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
              style={{ background: "#FAFAF8" }}>
              {/* Top accent */}
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#b45309,#c9a84c)" }} />
              <div className="px-8 py-7">
                <div className="flex items-center gap-2 mb-4">
                  {occasionIcon[post.occasion] || occasionIcon.allgemein}
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {occasionLabel[post.occasion] || "Gedanken"}
                    {post.occasion_year ? ` · ${post.occasion_year}. Jahrestag` : ""}
                  </span>
                  <span className="text-xs text-gray-300 ml-auto">
                    {format(parseISO(post.created_date), "d. MMMM yyyy", { locale: de })}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {post.title}
                </h3>
                <p className="text-gray-600 leading-8 whitespace-pre-wrap text-base" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                  {post.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}