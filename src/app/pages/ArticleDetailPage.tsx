import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Article {
  id: string;
  slug: string;
  image: string;
  category: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
  tags: string[];
}

export function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArticleDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil detail artikel");
      }

      const item = result.data;

      const mappedArticle: Article = {
        id: item.id,
        slug: item.slug,
        image:
          item.cover_image ||
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=800&fit=crop",
        category: item.category || "Tips Belajar",
        title: item.title,
        author: item.author || "Admin Bimbel Saka",
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        readTime: item.read_time || "5 menit",
        content: item.content || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
      };

      setArticle(mappedArticle);

      const relatedResponse = await fetch(`${API_BASE_URL}/api/articles`);
      const relatedResult = await relatedResponse.json();

      if (relatedResponse.ok) {
        const relatedMapped: Article[] = (relatedResult.data || [])
          .filter((a: any) => a.id !== item.id)
          .slice(0, 3)
          .map((a: any) => ({
            id: a.id,
            slug: a.slug,
            image:
              a.cover_image ||
              "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
            category: a.category || "Tips Belajar",
            title: a.title,
            author: a.author || "Admin Bimbel Saka",
            date: a.created_at
              ? new Date(a.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "",
            readTime: a.read_time || "5 menit",
            content: a.content || "",
            tags: Array.isArray(a.tags) ? a.tags : [],
          }));

        setRelatedArticles(relatedMapped);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleDetail();

    const interval = setInterval(
      () => {
        fetchArticleDetail();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [id]);

  const safeContent = useMemo(() => {
    if (!article?.content) return "";
    return article.content;
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memuat artikel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-primary/90 pt-32 pb-8 md:pt-40 md:pb-12 relative overflow-hidden">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            to="/artikel"
            className="inline-flex items-center gap-2 !text-white/90 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Artikel
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium mb-4">
              {article.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {article.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.date}</span>
              </div>
              <span>{article.readTime} baca</span>
            </div>
          </div>

          <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-8 shadow-xl">
            <ImageWithFallback
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="w-5 h-5 text-muted-foreground" />
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary/30 text-foreground rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-secondary/30 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Artikel Terkait
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/artikel/${relatedArticle.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <ImageWithFallback
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium mb-2">
                      {relatedArticle.category}
                    </div>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {relatedArticle.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
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
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Butuh Bimbingan Belajar?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Bergabunglah dengan Bimbel Saka dan dapatkan bimbingan dari
                tutor profesional
              </p>
              <Link
                to="/daftar"
                className="inline-block px-8 py-4 bg-accent !text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
