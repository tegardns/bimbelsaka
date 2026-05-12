import { Home, Video } from "lucide-react";

export function Methods() {
  const methods = [
    {
      icon: Home,
      title: "Tutor ke Rumah",
      description:
        "Tutor datang langsung ke rumah kamu di Purbalingga. Belajar lebih nyaman dan fokus.",
      color: "from-primary/10 to-accent/5",
    },
    {
      icon: Video,
      title: "Les Online",
      description:
        "Belajar jarak jauh via Zoom/Gmeet. Tetap interaktif dan efektif dari mana saja.",
      color: "from-accent/10 to-primary/5",
    },
  ];

  return (
    <section id="metode" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-accent/10 rounded-full mb-4">
            <span className="text-sm text-accent font-medium">
              Metode Belajar
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pilih Metode
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fleksibilitas belajar sesuai kenyamanan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {methods.map((method, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${method.color} rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <method.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">
                  {method.title}
                </h4>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {method.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
