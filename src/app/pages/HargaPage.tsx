import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { FAQ } from "../components/FAQ";

export function HargaPage() {
  const navigate = useNavigate();

  const pricing = [
    { program: "Calistung", price: "35rb", duration: "75 menit" },
    { program: "SD", price: "35rb", duration: "90 menit", popular: true },
    { program: "SMP", price: "40rb", duration: "90 menit" },
  ];

  const packages = [
    { program: "Calistung", price: "25rb/siswa", duration: "75 menit" },
    { program: "SD", price: "25rb/siswa", duration: "90 menit" },
    { program: "SMP", price: "30rb/siswa", duration: "90 menit" },
  ];

  const bulanan = [
    { program: "Calistung", price: "270rb", sessions: "8x/bulan" },
    { program: "SD", price: "270rb", sessions: "8x/bulan" },
    { program: "SMP", price: "300rb", sessions: "8x/bulan" },
  ];

  const benefits = [
    "Sudah termasuk biaya transport tutor",
    "Dapat worksheet/modul pembelajaran",
    "Garansi ganti tutor jika tidak cocok",
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col items-center">
      {/* Blue Header Section */}
      <section className="w-full bg-gradient-to-br from-primary to-primary/90 pt-20 pb-24 md:pt-28 md:pb-32 relative overflow-hidden flex flex-col items-center">
        {/* Pattern Overlays */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <div className="w-full max-w-lg px-4 relative z-10 flex flex-col items-center">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="self-start flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Kembali
          </button>

          {/* Badge & Headings */}
          <div className="flex flex-col items-center text-center">
            <span className="px-4 py-1.5 bg-white/10 text-white border border-white/20 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
              Harga Terjangkau
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
              Gratis Biaya Registrasi
            </h1>
            <p className="text-xs sm:text-sm text-white/85">
              Investasi terbaik untuk masa depan
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area overlapping the blue header */}
      <div className="w-full max-w-lg px-4 relative z-20 -mt-16 md:-mt-20 flex flex-col">
        {/* Table 1: Reguler */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100/80 overflow-hidden mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0066FF] text-white">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[40%]">
                  Program
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[35%]">
                  Harga/Sesi
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[25%]">
                  Durasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pricing.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4.5 font-bold text-slate-800 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {item.program}
                    {item.popular && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#E6F9F5] text-[#00BFA6] text-[10px] font-bold rounded-full border border-[#9df0e2]">
                        👍 Populer
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4.5 font-bold text-[#0066FF] text-base">
                    {item.price}
                  </td>
                  <td className="px-5 py-4.5 text-slate-400 text-xs">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Paket Ber-2 */}
        <div className="flex flex-col items-center text-center mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Ambil paket ber-2 💙
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Khusus untuk <strong className="text-slate-800">Program Paket</strong> mohon chat admin terlebih dahulu.
          </p>
        </div>

        {/* Table 2: Paket Ber-2 */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100/85 overflow-hidden mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#00C9A7] to-[#0082FB] text-white">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[40%]">
                  Program
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[35%]">
                  Harga/Sesi
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[25%]">
                  Durasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {packages.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4.5 font-bold text-slate-800">
                    {item.program}
                  </td>
                  <td className="px-5 py-4.5 font-bold text-slate-800 text-base">
                    {item.price}
                  </td>
                  <td className="px-5 py-4.5 text-slate-400 text-xs">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Paket Bulanan */}
        <div className="flex flex-col items-center text-center mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Ambil paket bulanan 💙
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Paket bulanan adalah program belajar dengan jadwal tetap setiap minggu selama 1 bulan. Cocok untuk yang ingin konsisten belajar dan mendapatkan hasil maksimal!
          </p>
        </div>

        {/* Table 3: Paket Bulanan */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100/85 overflow-hidden mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#00C9A7] to-[#0082FB] text-white">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[40%]">
                  Program
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[35%]">
                  Harga
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider w-[25%]">
                  Sesi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bulanan.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4.5 font-bold text-slate-800">
                    {item.program}
                  </td>
                  <td className="px-5 py-4.5 font-bold text-slate-800 text-base">
                    {item.price}
                  </td>
                  <td className="px-5 py-4.5 text-slate-400 text-xs">
                    {item.sessions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Benefits Section */}
        <div className="bg-[#F4FAFA] rounded-2xl p-5 border border-[#E0F2F1] space-y-3.5 mb-10">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-transparent flex items-center justify-center text-[#00BFA6] flex-shrink-0 mt-0.5">
                <Check className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mb-6">
          <Link
            to="/daftar"
            className="inline-block w-full px-8 py-4 bg-gradient-to-r from-[#0066FF] to-[#00BFA6] text-white! rounded-xl font-bold text-sm hover:shadow-lg transition-all shadow-md shadow-blue-500/10"
          >
            Mulai Daftar Sekarang
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-2xl px-4 mt-8">
        <FAQ />
      </div>
    </div>
  );
}
