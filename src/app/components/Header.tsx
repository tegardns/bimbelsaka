import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSaka from "../../imports/bim.png";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-primary/70 backdrop-blur-lg shadow-lg"
          : "border-b border-transparent"
      }`}
    >
      {/* Pattern only when scrolled */}
      {isScrolled && (
        <>
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>

          {/* Diagonal lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
              backgroundSize: "48px 48px",
            }}
          ></div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoSaka}
              alt="Bimbel Saka Logo"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "!text-white"
                  : "!text-white/80 hover:!text-white"
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/karir"
              className={`text-sm font-medium transition-colors ${
                isActive("/karir")
                  ? "!text-white"
                  : "!text-white/80 hover:!text-white"
              }`}
            >
              Karir
            </Link>
            <Link
              to="/artikel"
              className={`text-sm font-medium transition-colors ${
                isActive("/artikel")
                  ? "!text-white"
                  : "!text-white/80 hover:!text-white"
              }`}
            >
              Artikel
            </Link>
            <Link
              to="/daftar"
              className="ml-2 px-6 py-2.5 bg-accent !text-white rounded-xl font-medium hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/30 hover:scale-105"
            >
              Daftar Les
            </Link>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full border-t border-white/10 bg-primary/80 backdrop-blur-xl">
            {/* Pattern layers */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            ></div>
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
                backgroundSize: "48px 48px",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>

            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left py-2 transition-colors ${
                    isActive("/")
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Beranda
                </Link>
                <Link
                  to="/karir"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left py-2 transition-colors ${
                    isActive("/karir")
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Karir
                </Link>
                <Link
                  to="/artikel"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left py-2 transition-colors ${
                    isActive("/artikel")
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Artikel
                </Link>
                <Link
                  to="/daftar"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 py-3 px-5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all text-center"
                >
                  Daftar Les
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
