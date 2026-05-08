import { Calendar, User, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Article {
  id: string;
  slug: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "Semua",
    "Tips Belajar",
    "Strategi Ujian",
    "Pengalaman Siswa",
    "Parenting",
    "Teknologi",
    "Calistung",
  ];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/articles`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil artikel");
      }

      const mapped: Article[] = (result.data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        image:
          item.cover_image ||
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
        category: item.category || "Tips Belajar",
        title: item.title,
        excerpt: item.excerpt || "",
        author: item.author || "Admin Bimbel Saka",
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        readTime: item.read_time || "5 menit",
      }));

      setArticles(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

    const interval = setInterval(
      () => {
        fetchArticles();
      },
      5 * 60 * 1000,
    ); // Refresh setiap 5 menit

    return () => clearInterval(interval);
  }, []);

  const filteredArticles = useMemo(() => {
    return selectedCategory === "Semua"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-primary/90 pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Artikel & Tips Belajar
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Temukan berbagai tips, strategi, dan inspirasi untuk meningkatkan
            prestasi belajar
          </p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white shadow-lg"
                    : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-20 text-muted-foreground">
              Memuat artikel...
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium mb-3">
                      {article.category}
                    </div>

                    <h3 className="font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{article.date}</span>
                        </div>
                      </div>
                      <span>{article.readTime}</span>
                    </div>

                    <Link
                      to={`/artikel/${article.id}`}
                      className="flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Belum ada artikel di kategori ini
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
