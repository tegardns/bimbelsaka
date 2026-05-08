import { FileText, MessageCircle, Calendar, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export function HowToRegister() {
  const steps = [
    {
      icon: FileText,
      title: "Isi Formulir",
      description:
        'Klik tombol "Daftar Sekarang" dan isi formulir pendaftaran online',
      color: "from-primary to-primary/80",
    },
    {
      icon: MessageCircle,
      title: "Konsultasi",
      description:
        "Tim kami akan menghubungi kamu untuk konsultasi program dan jadwal",
      color: "from-accent to-accent/80",
    },
    {
      icon: Calendar,
      title: "Tentukan Jadwal",
      description: "Pilih jadwal les yang sesuai dengan waktu luang kamu",
      color: "from-primary to-primary/80",
    },
    {
      icon: Rocket,
      title: "Mulai Belajar",
      description:
        "Tutor akan datang sesuai jadwal dan kamu siap memulai perjalanan belajar",
      color: "from-accent to-accent/80",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-accent/10 rounded-full mb-4">
            <span className="text-sm text-accent font-medium">Cara Daftar</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mudah & Cepat, Hanya 4 Langkah
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proses pendaftaran yang simple dan tidak ribet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 h-full">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-4 text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/30 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/daftar"
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent !text-white rounded-xl font-medium hover:shadow-xl transition-all shadow-lg"
          >
            Mulai Daftar Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
