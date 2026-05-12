import { BookOpen, GraduationCap, Calculator } from "lucide-react";

export function Services() {
  const programs = [
    {
      icon: Calculator,
      title: "Calistung",
      subtitle: "Usia 4-7 Tahun",
      description:
        "Belajar sambil bermain untuk menumbuhkan minat baca, tulis, dan hitung anak.",
    },
    {
      icon: BookOpen,
      title: "SD - SMP",
      subtitle: "Kelas 1-9",
      description:
        "Pendalaman materi kurikulum, persiapan ujian, dan pemantapan konsep dasar.",
    },
    {
      icon: GraduationCap,
      title: "SMA (Coming Soon)",
      subtitle: "Kelas 10-12",
      description:
        "Persiapan UTBK, ujian sekolah, dan pendalaman materi untuk masuk PTN impian.",
    },
  ];

  return (
    <section
      id="program"
      className="py-20 md:py-28 bg-gradient-to-b from-white to-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-sm text-primary font-medium">
              Program Kami
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Program Belajar untuk Setiap Jenjang
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih program sesuai kebutuhan
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <program.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-bold text-foreground mb-1">
                {program.title}
              </h3>
              <p className="text-sm text-primary font-medium mb-3">
                {program.subtitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
