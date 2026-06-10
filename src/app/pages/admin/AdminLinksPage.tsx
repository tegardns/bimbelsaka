import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, Upload, Image as ImageIcon, Check, HelpCircle } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { supabase } from "../../../lib/supabase";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
}

export function AdminLinksPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [title, setTitle] = useState("Bimbel Saka");
  const [tagline, setTagline] = useState("Ada Saka, Pasti Bisa!");
  const [logoUrl, setLogoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/bimbelsaka");
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/62895357409769");

  // Banner states
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerActive, setBannerActive] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Links list state
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // Storage table alert
  const [supabaseSqlPrompt, setSupabaseSqlPrompt] = useState("");

  // Icon options
  const iconOptions = [
    { value: "HeartHandshake", label: "Heart Handshake (❤️)" },
    { value: "UserPlus", label: "Daftar / Registrasi (👤+)" },
    { value: "FileSpreadsheet", label: "Formulir / Spreadsheet (📝)" },
    { value: "Briefcase", label: "Karir / Pekerjaan (💼)" },
    { value: "Sparkles", label: "AI / Bintang (✨)" },
    { value: "Brain", label: "Kognitif / Otak (🧠)" },
    { value: "Globe", label: "Website (🌐)" },
    { value: "MessageCircle", label: "WhatsApp Chat (💬)" },
    { value: "Phone", label: "Telepon (📞)" },
    { value: "Link2", label: "Tautan Biasa (🔗)" }
  ];

  useEffect(() => {
    fetchLinktreeConfig();
  }, []);

  const fetchLinktreeConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/linktree_config`);
      const result = await response.json();

      if (result.success && result.data) {
        const d = result.data;
        setTitle(d.title || "");
        setTagline(d.tagline || "");
        setLogoUrl(d.logoUrl || "");
        setInstagramUrl(d.instagramUrl || "");
        setWhatsappUrl(d.whatsappUrl || "");
        
        if (d.banner) {
          setBannerImage(d.banner.imageUrl || "");
          setBannerLink(d.banner.linkUrl || "");
          setBannerActive(d.banner.isActive || false);
        }

        setLinks(d.links || []);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat konfigurasi dari server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      setSupabaseSqlPrompt("");

      const payload = {
        value: {
          title,
          tagline,
          logoUrl,
          instagramUrl,
          whatsappUrl,
          banner: {
            imageUrl: bannerImage,
            linkUrl: bannerLink,
            isActive: bannerActive
          },
          links
        }
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/settings/linktree_config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "TABLE_NOT_FOUND") {
          setSupabaseSqlPrompt(result.sql || "");
          throw new Error(result.message);
        }
        throw new Error(result.message || "Gagal menyimpan konfigurasi");
      }

      setSuccessMsg("Konfigurasi halaman link berhasil disimpan.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setShowSaveConfirm(false);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setShowSaveConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      title: "Link Baru",
      url: "https://",
      icon: "Link2",
      isActive: true
    };
    setLinks([...links, newLink]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleUpdateLink = (id: string, field: keyof LinkItem, val: any) => {
    setLinks(
      links.map((link) => {
        if (link.id === id) {
          return { ...link, [field]: val };
        }
        return link;
      })
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index - 1];
    newLinks[index - 1] = temp;
    setLinks(newLinks);
  };

  const handleMoveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + 1];
    newLinks[index + 1] = temp;
    setLinks(newLinks);
  };

  // Upload Logo Image
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      setError("");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `linktree/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images") // Re-use the existing bucket
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
    } catch (err: any) {
      setError(`Gagal mengunggah logo: ${err.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Upload Banner Image
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `linktree/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setBannerImage(data.publicUrl);
      setBannerActive(true); // Auto-activate on upload
    } catch (err: any) {
      setError(`Gagal mengunggah banner: ${err.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Kelola Halaman Links (Linktree)
        </h1>
        <p className="text-muted-foreground">
          Sesuaikan logo, tagline, link sosial media, banner promosi, dan tombol tautan eksternal.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <p className="font-semibold">{error}</p>
          {supabaseSqlPrompt && (
            <div className="mt-4">
              <p className="text-sm mb-2 font-bold text-slate-800">
                Langkah Solusi: Silakan jalankan kueri SQL berikut di dashboard editor SQL Supabase Anda untuk membuat tabel settings:
              </p>
              <pre className="p-3 bg-slate-800 text-slate-100 rounded-lg text-xs overflow-x-auto font-mono">
                {supabaseSqlPrompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          Memuat konfigurasi linktree...
        </div>
      ) : (
        <form onSubmit={handleSaveClick} className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Profil</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama/Judul Profil
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Contoh: Bimbel Saka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Contoh: Ada Saka, Pasti Bisa!"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Logo Profil</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full border flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Masukkan URL Logo atau Upload"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border text-xs font-semibold text-slate-700 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Logo Baru
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  WhatsApp Link
                </label>
                <input
                  type="text"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          {/* Dynamic Banner Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800">Banner Promosi</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-slate-600">Aktifkan Banner</span>
                <input
                  type="checkbox"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                  className="w-4 h-4 text-[#0066FF] border-gray-300 rounded focus:ring-primary"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Link Tujuan Banner
                  </label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Contoh: /harga atau link eksternal"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika banner tidak dapat diklik</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL Gambar Banner
                  </label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="URL gambar banner"
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066FF] hover:bg-blue-700 text-sm font-bold text-white rounded-xl cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-4 h-4" />
                    Pilih & Unggah File Banner
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preview Banner */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col justify-center items-center bg-slate-50 min-h-36 overflow-hidden">
                {bannerImage ? (
                  <div className="w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                      Pratinjau Banner:
                    </span>
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-auto object-cover max-h-36 rounded-lg border shadow-sm" />
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Belum ada gambar banner diupload</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links List Manager */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800">Daftar Link & Tombol</h2>
              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF]/10 text-[#0066FF] text-xs font-bold rounded-lg hover:bg-[#0066FF]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Link Baru
              </button>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada tautan. Klik tombol "Tambah Link Baru" di atas.
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link, index) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-start md:items-center"
                  >
                    {/* Reordering column */}
                    <div className="flex md:flex-col gap-1 w-full md:w-auto justify-end order-last md:order-first">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                        title="Geser Atas"
                      >
                        <ArrowUp className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === links.length - 1}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                        title="Geser Bawah"
                      >
                        <ArrowDown className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    {/* Form Input fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Nama Link
                        </label>
                        <input
                          type="text"
                          required
                          value={link.title}
                          onChange={(e) => handleUpdateLink(link.id, "title", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                          placeholder="Judul tombol"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          URL Tujuan
                        </label>
                        <input
                          type="text"
                          required
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, "url", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                          placeholder="URL / rute tujuan"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Ikon
                        </label>
                        <select
                          value={link.icon}
                          onChange={(e) => handleUpdateLink(link.id, "icon", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
                        >
                          {iconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-4 pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateLink(link.id, "isActive", !link.isActive)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            link.isActive
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {link.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Aktif
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Nonaktif
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg transition-colors ml-auto sm:ml-0"
                          title="Hapus Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="Simpan Konfigurasi"
        message="Apakah Anda yakin ingin menyimpan semua perubahan profil linktree dan banner?"
        confirmText="Ya, Simpan"
        cancelText="Batal"
        type="info"
        onConfirm={handleSaveConfirm}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
}
