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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Mudah & Cepat
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proses pendaftaran yang simple
          </p>
        </div>

        {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 h-full">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 bg-accent ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold mb-4 text-sm">
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
        </div> */}

        <div className="max-w-2xl mx-auto px-6">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 relative group">
                {/* Garis Alur Vertikal (Line Connector) */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-[-48px] w-[2px] bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                )}

                {/* Bagian Icon/Angka */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 relative z-10">
                    <step.icon className="w-8 h-8 text-white" />

                    {/* Badge Angka Minimalist */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bagian Konten Teks */}
                <div className="flex flex-col justify-center pb-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
