import {
  Award,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { ImageSlider } from "./ImageSlider";
import { Link } from "react-router-dom";

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Users,
      title: "Tutor Kompeten",
      description:
        "Tim pengajar berpengalaman dengan metode mengajar yang efektif.",
    },
    {
      icon: Clock,
      title: "Jadwal Fleksibel",
      description:
        "Atur jadwal belajar sesuai kenyamanan kamu dengan sistem booking yang mudah.",
    },
    {
      icon: BookOpen,
      title: "Request Mapel & Tutor",
      description:
        "Pilih mata pelajaran dan request tutor sesuai preferensi kamu.",
    },
    {
      icon: Award,
      title: "Metode Pembelajaran Personal",
      description:
        "Setiap siswa mendapat perhatian khusus dengan kurikulum sesuai kebutuhan individu.",
    },
    {
      icon: RefreshCw,
      title: "Garansi Ganti Tutor",
      description:
        "Tidak cocok dengan tutor? Kami sediakan garansi ganti tutor gratis.",
    },
    {
      icon: CheckCircle2,
      title: "Laporan Perkembangan Rutin",
      description:
        "Orang tua mendapat laporan berkala untuk memantau kemajuan belajar anak.",
    },
  ];

  return (
    <section id="why-choose-us" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-accent/10 rounded-full mb-4">
            <span className="text-sm text-accent font-medium">
              Keunggulan Kami
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mengapa Memilih Bimbel Saka?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Komitmen kami adalah memberikan pengalaman belajar terbaik untuk
            setiap siswa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <reason.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <ImageSlider />
            <div>
              <h3 className="text-2xl md:text-4xl font-bold mb-6">
                Siap Memulai Perjalanan Belajar?
              </h3>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Raih prestasi terbaik dengan bimbingan personal dari tutor
                berpengalaman. Konsultasi gratis untuk menentukan program yang
                tepat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/daftar"
                  className="px-8 py-4 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/30"
                >
                  Daftar Sekarang
                </Link>
                <a
                  href="https://api.whatsapp.com/send/?phone=62895357409769&text&type=phone_number&app_absent=0"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Konsultasi Gratis
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
