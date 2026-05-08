import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { supabase } from "../../../lib/supabase";

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AdminArticlesPage() {
  // const [articles, setArticles] = useState<Article[]>([
  //   {
  //     id: 1,
  //     title: "5 Cara Efektif Meningkatkan Konsentrasi Belajar",
  //     category: "Tips Belajar",
  //     excerpt:
  //       "Temukan metode belajar yang tepat untuk meningkatkan fokus dan konsentrasi.",
  //     content: "<p>Konten artikel lengkap...</p>",
  //     image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
  //     author: "Admin Bimbel Saka",
  //     date: "2026-05-07",
  //     readTime: "5 menit",
  //     tags: ["Konsentrasi", "Produktivitas"],
  //   },
  // ]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/articles/admin`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil artikel");
      }

      const mapped: Article[] = result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category || "",
        excerpt: item.excerpt || "",
        content: item.content || "",
        image: item.cover_image || "",
        author: item.author || "Admin Bimbel Saka",
        date: item.created_at
          ? new Date(item.created_at).toISOString().split("T")[0]
          : "",
        readTime: item.read_time || "",
        tags: item.tags || [],
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

  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    image: "",
    readTime: "",
    tags: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        readTime: article.readTime,
        tags: article.tags.join(", "),
      });
      setImagePreview(article.image);
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        image: "",
        readTime: "",
        tags: "",
      });
      setImagePreview("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArticle(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = async () => {
    try {
      let coverImageUrl = formData.image.trim();

      if (imageFile) {
        coverImageUrl = await uploadArticleImage(imageFile);
      }

      const payload = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: coverImageUrl,
        read_time: formData.readTime,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        status: "published",
        author: "Admin Bimbel Saka",
      };

      const method = editingArticle ? "PUT" : "POST";
      const url = editingArticle
        ? `${API_BASE_URL}/api/articles/admin/${editingArticle.id}`
        : `${API_BASE_URL}/api/articles/admin`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menyimpan artikel");
      }

      await fetchArticles();
      setShowSaveConfirm(false);
      handleCloseModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert(msg);
    }
  };

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/articles/admin/${articleToDelete}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menghapus artikel");
      }

      await fetchArticles();

      setShowDeleteConfirm(false);

      setArticleToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";

      alert(msg);
    }
  };

  const uploadArticleImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Data Artikel
            </h1>
            <p className="text-muted-foreground">
              Kelola artikel website Bimbel Saka
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Artikel
          </button>
        </div>

        {/* Articles List */}
        <div className="grid gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-64 h-48 md:h-auto bg-gray-200">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium mb-2">
                        {article.category}
                      </span>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(article)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(article.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Judul Artikel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Masukkan judul artikel"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kategori *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Pilih kategori</option>
                      <option value="Tips Belajar">Tips Belajar</option>
                      <option value="Strategi Ujian">Strategi Ujian</option>
                      <option value="Pengalaman Siswa">Pengalaman Siswa</option>
                      <option value="Parenting">Parenting</option>
                      <option value="Teknologi">Teknologi</option>
                      <option value="Calistung">Calistung</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Waktu Baca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData({ ...formData, readTime: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Contoh: 5 menit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ringkasan/Excerpt *
                  </label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Tuliskan ringkasan singkat artikel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gambar Utama * (Max 5MB)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {imagePreview && (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!imagePreview && (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Konten Artikel *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                    placeholder="Tulis konten artikel dalam format HTML atau teks biasa"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Gunakan HTML tags untuk formatting (contoh: &lt;h3&gt;,
                    &lt;p&gt;, &lt;strong&gt;)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Contoh: Konsentrasi, Produktivitas, Tips Belajar"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingArticle ? "Update Artikel" : "Simpan Artikel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Konfirmasi Hapus Artikel"
          message="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setArticleToDelete(null);
          }}
        />

        {/* Save Confirmation */}
        <ConfirmDialog
          isOpen={showSaveConfirm}
          title={
            editingArticle
              ? "Konfirmasi Ubah Artikel"
              : "Konfirmasi Simpan Artikel"
          }
          message={
            editingArticle
              ? "Apakah Anda yakin ingin menyimpan perubahan artikel ini?"
              : "Apakah Anda yakin ingin menyimpan artikel baru ini?"
          }
          confirmText="Ya, Simpan"
          cancelText="Batal"
          type="info"
          onConfirm={handleSaveConfirm}
          onCancel={() => setShowSaveConfirm(false)}
        />
      </div>
    </>
  );
}
