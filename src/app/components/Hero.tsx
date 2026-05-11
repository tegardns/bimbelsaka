import { ArrowRight, Play } from "lucide-react";
import { HeroCarousel } from "./HeroCarousel";
import { PromoBanner } from "./PromoBanner";
import { Link } from "react-router-dom";

export function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-20 pb-16 md:pt-32 md:pb-28 bg-gradient-to-br from-primary via-[#0052CC] to-[#003D99] overflow-hidden"
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Diagonal subtle lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.5) 49%, rgba(255,255,255,0.5) 51%, transparent 52%)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-white">
            {/* Promo Banner - Mobile Only */}
            <PromoBanner />

            <div className="inline-block px-3 md:px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-3 md:mb-6">
              <span className="text-xs md:text-sm">
                🎓 Bimbingan Belajar Terpercaya di Purbalingga
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 md:mb-6 leading-tight">
              Hadirkan Guru Terbaik Langsung ke Rumah Kamu
            </h1>

            <p className="text-base md:text-xl mb-6 md:mb-8 text-white/90 leading-relaxed">
              Pendampingan belajar personal untuk Calistung hingga SMA. Tersedia{" "}
              <strong>Tutor ke Rumah</strong> dan <strong>Les Online</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link
                to="/daftar"
                className="px-6 md:px-8 py-3 md:py-4 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Daftar Les Sekarang
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </Link>

              <Link
                to="/karir"
                className="px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Jadi Tutor
                {/* <Play className="w-4 md:w-5 h-4 md:h-5" /> */}
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-3 md:gap-4">
              <div className="md:rounded-2xl p-4 md:p-5">
                <div className="text-xl md:text-3xl font-bold mb-1.5 md:mb-2 text-white leading-tight">
                  1-on-1
                </div>
                <div className="text-[10px] md:text-sm text-white/80 leading-snug">
                  Metode Personal
                </div>
              </div>
              <div className="md:rounded-2xl p-4 md:p-5">
                <div className="text-xl md:text-3xl font-bold mb-1.5 md:mb-2 text-white leading-tight">
                  Fleksibel
                </div>
                <div className="text-[10px] md:text-sm text-white/80 leading-snug">
                  Jadwal Sesuai Keinginan
                </div>
              </div>
              <div className="md:rounded-2xl p-4 md:p-5">
                <div className="text-xl md:text-3xl font-bold mb-1.5 md:mb-2 text-white leading-tight">
                  Garansi
                </div>
                <div className="text-[10px] md:text-sm text-white/80 leading-snug">
                  Ganti Tutor
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
