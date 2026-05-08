import { GraduationCap, Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import logoSaka from "../../imports/bim.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-foreground to-foreground/95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoSaka} alt="Bimbel Saka Logo" className="h-14 w-auto object-contain" />
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Membangun fondasi masa depan cemerlang dengan metode pembelajaran personal dan tutor berpengalaman.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Program</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => scrollToSection('services')} className="text-white/70 hover:text-white transition-colors">
                  Calistung
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-white/70 hover:text-white transition-colors">
                  SD - SMP
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-white/70 hover:text-white transition-colors">
                  SMA & UTBK
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-white/70 hover:text-white transition-colors">
                  Home Visit
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-white/70 hover:text-white transition-colors">
                  Online Learning
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => scrollToSection('why-choose-us')} className="text-white/70 hover:text-white transition-colors">
                  Tentang Kami
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('career')} className="text-white/70 hover:text-white transition-colors">
                  Karir
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('articles')} className="text-white/70 hover:text-white transition-colors">
                  Artikel
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-white/70 hover:text-white transition-colors">
                  Kontak
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-white/70">
                Jl. Veteran Wirasana<br />
                Purbalingga, Jawa Tengah<br />
                53318
              </li>
              <li>
                <a href="tel:+62281234567" className="text-white/70 hover:text-white transition-colors">
                  (0281) 123-4567
                </a>
              </li>
              <li>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                  +62 812-3456-7890 (WA)
                </a>
              </li>
              <li>
                <a href="mailto:info@bimbelsaka.com" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@bimbelsaka.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {currentYear} Bimbel Saka. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <button className="hover:text-white transition-colors">
                Kebijakan Privasi
              </button>
              <button className="hover:text-white transition-colors">
                Syarat & Ketentuan
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
