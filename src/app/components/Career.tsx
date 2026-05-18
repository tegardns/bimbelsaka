import { Briefcase, Heart, TrendingUp, Users } from "lucide-react";

export function Career() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Pengembangan Karir",
      description: "Pelatihan berkelanjutan dan kesempatan berkembang",
    },
    {
      icon: Heart,
      title: "Lingkungan Positif",
      description: "Tim yang suportif dan budaya kerja yang sehat",
    },
    {
      icon: Users,
      title: "Dampak Nyata",
      description: "Berkontribusi langsung pada masa depan siswa",
    },
  ];

  return (
    <section
      id="career"
      className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
              <span className="text-sm text-primary font-medium">
                Bergabung Bersama Kami
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Mari Bergabung dan Menginspirasi Bersama Kami
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Bergabunglah sebagai tutor Bimbel Saka. Bagikan ilmu dan
              berkembang bersama kami dalam dunia pendidikan.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                window.open(
                  "https://forms.gle/your-tutor-registration-form",
                  "_blank",
                )
              }
              className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg inline-flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              Isi Formulir Pendaftaran Tutor
            </button>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h4 className="font-semibold text-foreground mb-2">
                    Persyaratan:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                      <span>Minimal pendidikan D3/S1/mahasiswa akhir </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                      <span>IPK minimal 3.00</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                      <span>Menguasai mata pelajaran yang diampu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                      <span>Komunikatif dan sabar dalam mengajar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                      <span>Berdomisili di Purbalingga atau Purwokerto</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h4 className="font-semibold text-foreground mb-2">
                    Posisi Tersedia:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                      Tutor Calistung
                    </span>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                      Tutor SD
                    </span>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                      Tutor SMP
                    </span>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                      Tutor SMA
                    </span>
                    <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm">
                      Matematika
                    </span>
                    <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm">
                      Bahasa Inggris
                    </span>
                    <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm">
                      Fisika
                    </span>
                    <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm">
                      Kimia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
