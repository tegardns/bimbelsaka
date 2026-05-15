import { Pencil, BookOpen, Atom } from "lucide-react";

export function Services() {
  const programs = [
    {
      icon: Pencil,
      title: "Calistung",
      subtitle: "Usia 4-7 Tahun",
      labels: ["Membaca", "Menulis", "Berhitung"],
    },
    {
      icon: BookOpen,
      title: "SD",
      subtitle: "Kelas 1-6",
      labels: ["Semua Mata Pelajaran"],
    },
    {
      icon: Atom,
      title: "SMP",
      subtitle: "Kelas 7-9",
      labels: ["Matematika", "IPA", "Bahasa Inggris"],
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
              <p className="text-sm text-primary font-medium mb-4">
                {program.subtitle}
              </p>

              {/* Bagian Label Mata Pelajaran */}
              <div className="flex flex-wrap gap-2">
                {program.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
