import { Check } from "lucide-react";

export function Pricing() {
  const pricing = [
    {
      program: "Calistung",
      level: "Usia 4-7 Tahun",
      price: "40k",
      duration: "75 menit",
    },
    { program: "SD", level: "Kelas 1-6", price: "40k", duration: "90 menit" },
    { program: "SMP", level: "Kelas 7-9", price: "40k", duration: "90 menit" },
    {
      program: "SMA",
      level: "Kelas 10-12",
      price: "Coming Soon",
      duration: "Coming Soon",
    },
  ];

  const benefits = [
    "Sudah termasuk biaya transport tutor",
    "Dapat worksheet/modul pembelajaran",
    "Reward bulanan bagi siswa yang aktif",
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-accent/10 rounded-full mb-4">
            <span className="text-sm text-accent font-medium">
              Harga Terjangkau
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Gratis Biaya Registrasi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Investasi terbaik untuk masa depan
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary to-primary/90">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-white font-semibold">
                    Program
                  </th>
                  {/* <th className="px-3 md:px-6 py-4 text-left text-white font-semibold text-sm md:text-base">Tingkat</th> */}
                  <th className="px-4 md:px-6 py-4 text-left text-white font-semibold">
                    Harga/Sesi
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-white font-semibold">
                    Durasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pricing.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 font-semibold text-foreground">
                      {item.program}
                      {item.program === "SD" && (
                        <span className="text-[12px] font-medium ml-3 px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          👍 Populer
                        </span>
                      )}
                    </td>
                    {/* <td className="px-3 md:px-6 py-4 text-muted-foreground text-xs md:text-sm">{item.level}</td> */}
                    <td className="px-4 md:px-6 py-4 font-bold text-blue-600 text-lg ">
                      {item.price}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground text-sm md:text-base">
                      {item.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl p-6 border border-accent/20">
          {/* <h3 className="font-semibold text-foreground mb-4 text-center">Benefit yang Kamu Dapatkan:</h3> */}
          <div className="grid md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="mt-8 text-center">
          <button
            onClick={() => window.open('https://forms.gle/your-registration-form', '_blank')}
            className="px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30"
          >
            Daftar Sekarang
          </button>
        </div> */}
      </div>
    </section>
  );
}
