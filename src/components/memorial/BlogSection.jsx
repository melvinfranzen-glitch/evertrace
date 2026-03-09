import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { BookOpen, Cake, Heart } from "lucide-react";

const occasionIcon = {
  geburtstag: <Cake className="w-4 h-4 text-amber-600" />,
  todestag: <Heart className="w-4 h-4 text-rose-500" />,
  allgemein: <BookOpen className="w-4 h-4 text-stone-400" />,
};

const occasionLabel = {
  geburtstag: "Geburtstag",
  todestag: "Todestag",
  allgemein: "Erinnerung",
};

export default function BlogSection({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-20 px-6" style={{ background: "#F5F0E8" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#b45309" }}>Erinnerungen</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Jahrestags-Einträge
          </h2>
        </div>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 px-8 py-7">
              <div className="flex items-center gap-2 mb-3">
                {occasionIcon[post.occasion] || occasionIcon.allgemein}
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {occasionLabel[post.occasion] || "Erinnerung"}
                  {post.occasion_year ? ` · ${post.occasion_year}. Jahrestag` : ""}
                </span>
                <span className="text-xs text-gray-300 ml-auto">
                  {format(parseISO(post.created_date), "d. MMMM yyyy", { locale: de })}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {post.title}
              </h3>
              <p className="text-gray-600 leading-8 whitespace-pre-wrap text-base">
                {post.content}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}