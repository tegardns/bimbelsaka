import { GraduationCap, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function Contact() {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden"
    >
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Perjalanan Belajar?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Bergabunglah dengan Bimbel Saka dan raih prestasi terbaikmu
          </p>
        </div>

        {/* <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Daftar Kelas
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Mulai perjalanan belajar kamu bersama tutor berpengalaman. Pilih
              program yang sesuai dengan kebutuhan.
            </p>
            <Link
              to="/daftar"
              className="block w-full px-6 py-4 bg-primary !text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30 text-center"
            >
              Daftar Sebagai Siswa
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Jadi Tutor
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Bagikan ilmu dan pengalaman kamu. Bergabunglah dengan tim tutor
              profesional kami.
            </p>
            <Link
              to="/karir"
              className="block w-full px-6 py-4 bg-accent !text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 text-center"
            >
              Daftar Sebagai Tutor
            </Link>
          </div>
        </div> */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Daftar Kelas
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Mulai perjalanan belajar kamu bersama tutor berpengalaman. Pilih
              program yang sesuai dengan kebutuhan.
            </p>
            {/* mt-auto akan mendorong tombol ke dasar container */}
            <div className="mt-auto">
              <Link
                to="/daftar"
                className="block w-full px-6 py-4 bg-primary !text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30 text-center"
              >
                Daftar Sebagai Siswa
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Jadi Tutor
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Bagikan ilmu dan pengalaman kamu. Bergabunglah dengan tim tutor
              profesional kami.
            </p>
            {/* mt-auto akan mendorong tombol ke dasar container */}
            <div className="mt-auto">
              <Link
                to="/karir"
                className="block w-full px-6 py-4 bg-accent !text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 text-center"
              >
                Daftar Sebagai Tutor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
