import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import logoSaka from "../../imports/bim.png";
import logoWA from "../../../assets/whatsapp.svg";

export function LinksPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic icon helper
  const renderIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return <IconComp className="w-5 h-5 text-[#0066FF] flex-shrink-0" />;
    }
    return <Icons.Link2 className="w-5 h-5 text-[#0066FF] flex-shrink-0" />;
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/linktree_config`);
        const result = await response.json();
        if (result.success && result.data) {
          setConfig(result.data);
        }
      } catch (err) {
        console.error("Gagal memuat konfigurasi Links:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Fallback default config if API call fails or is empty
  const activeConfig = config || {
    logoUrl: logoSaka,
    title: "Bimbel Saka",
    tagline: "Ada Saka, Pasti Bisa!",
    instagramUrl: "https://instagram.com/bimbelsaka",
    whatsappUrl: "https://wa.me/62895357409769",
    banner: {
      imageUrl: "",
      linkUrl: "",
      isActive: false
    },
    links: [
      { id: "1", title: "HARGA AFFORDABLE ❤️", url: "/harga", icon: "HeartHandshake", isActive: true },
      { id: "2", title: "Gratis Registrasi", url: "/daftar", icon: "UserPlus", isActive: true },
      { id: "3", title: "DAFTAR LES", url: "/daftar", icon: "FileSpreadsheet", isActive: true },
      { id: "4", title: "KARIR", url: "/karir", icon: "Briefcase", isActive: true },
      { id: "5", title: "AI SAKA", url: "/tanya-pr", icon: "Sparkles", isActive: true },
      { id: "6", title: "TES LOGIKA", url: "/tes-logika", icon: "Brain", isActive: true },
      { id: "7", title: "OFFICIAL WEBSITE", url: "/", icon: "Globe", isActive: true }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex flex-col items-center space-y-3 mb-6">
            <div className="w-24 h-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-72 bg-gradient-to-b from-blue-50/70 to-transparent pointer-events-none rounded-full blur-3xl z-0" />

      <div className="w-full max-w-md mx-auto z-10 flex-1 flex flex-col justify-start">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-blue-100 rounded-full scale-105 blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
            <img
              src={activeConfig.logoUrl || logoSaka}
              alt="Bimbel Saka Logo"
              className="w-24 h-24 rounded-full border-4 border-white shadow-md relative z-10 object-cover bg-white"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {activeConfig.title}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {activeConfig.tagline}
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            {activeConfig.instagramUrl && (
              <a
                href={activeConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all text-white"
                aria-label="Instagram Profile"
              >
                <Icons.Instagram className="w-5 h-5 text-white" />
              </a>
            )}
            {activeConfig.whatsappUrl && (
              <a
                href={activeConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
                aria-label="WhatsApp Admin"
              >
                <img src={logoWA} alt="WhatsApp" className="w-5.5 h-5.5 select-none" style={{ width: "22px", height: "22px" }} />
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Banner (via CMS) */}
        {activeConfig.banner && activeConfig.banner.isActive && activeConfig.banner.imageUrl && (
          <div className="mb-6 transform hover:scale-[1.02] active:scale-[0.99] transition-all duration-300">
            {activeConfig.banner.linkUrl ? (
              <a
                href={activeConfig.banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden shadow-md border border-slate-100"
              >
                <img
                  src={activeConfig.banner.imageUrl}
                  alt="Promosi Banner"
                  className="w-full h-auto object-cover max-h-48"
                />
              </a>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100">
                <img
                  src={activeConfig.banner.imageUrl}
                  alt="Promosi Banner"
                  className="w-full h-auto object-cover max-h-48"
                />
              </div>
            )}
          </div>
        )}

        {/* Links List */}
        <div className="space-y-3.5 mb-10">
          {activeConfig.links
            ?.filter((link: any) => link.isActive)
            .map((link: any) => {
              const isExternal = link.url.startsWith("http://") || link.url.startsWith("https://") || link.url.startsWith("mailto:") || link.url.startsWith("tel:");

              const linkContent = (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    {renderIcon(link.icon)}
                  </div>
                  <span className="font-bold text-[14px] text-slate-700 group-hover:text-blue-700 flex-1 text-center pr-10">
                    {link.title}
                  </span>
                </>
              );

              const cardClasses = "w-full p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center hover:shadow-md hover:border-blue-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group text-left";

              if (isExternal) {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClasses}
                  >
                    {linkContent}
                  </a>
                );
              }

              return (
                <Link key={link.id} to={link.url} className={cardClasses}>
                  {linkContent}
                </Link>
              );
            })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-4 z-10">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          © {new Date().getFullYear()} Bimbel Saka. All rights reserved.
        </p>
      </div>
    </div>
  );
}
