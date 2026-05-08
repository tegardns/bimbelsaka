import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

export function Articles() {
  const articles = [
    {
      title: '5 Cara Efektif Menumbuhkan Minat Baca pada Anak Sejak Dini',
      excerpt: 'Membangun kebiasaan membaca sejak dini adalah investasi terbaik untuk masa depan anak. Berikut tips praktis yang bisa diterapkan orang tua...',
      date: '15 April 2026',
      category: 'Tips Pendidikan',
      color: 'from-primary/10 to-primary/5'
    },
    {
      title: 'Persiapan Menghadapi Ujian Nasional di Purbalingga',
      excerpt: 'Strategi belajar efektif dan manajemen waktu yang tepat untuk menghadapi ujian nasional dengan percaya diri dan meraih nilai maksimal...',
      date: '10 April 2026',
      category: 'Persiapan Ujian',
      color: 'from-accent/10 to-accent/5'
    },
    {
      title: 'Metode Belajar Online yang Efektif untuk Siswa SMA',
      excerpt: 'Di era digital, belajar online menjadi pilihan utama. Temukan cara memaksimalkan pembelajaran jarak jauh dengan strategi yang terbukti...',
      date: '5 April 2026',
      category: 'Pembelajaran Digital',
      color: 'from-primary/10 to-accent/5'
    }
  ];

  return (
    <section id="articles" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-sm text-primary font-medium">Ruang Literasi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tips & Inspirasi Pendidikan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artikel dan panduan praktis untuk mendukung perjalanan belajar kamu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-48 bg-gradient-to-br ${article.color} flex items-center justify-center`}>
                <BookOpen className="w-16 h-16 text-primary/40" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {article.excerpt}
                </p>

                <button className="text-primary font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all border border-border">
            Lihat Semua Artikel
          </button>
        </div>
      </div>
    </section>
  );
}
