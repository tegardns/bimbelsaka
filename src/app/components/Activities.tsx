import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Activities() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dummy images - nanti bisa diganti dengan foto asli
  const allActivities = [
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop',
      caption: 'Kegiatan Belajar SD'
    },
    {
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=600&fit=crop',
      caption: 'Sesi Les Online'
    },
    {
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=600&fit=crop',
      caption: 'Pembelajaran Calistung'
    },
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop',
      caption: 'Bimbingan SMA & UTBK'
    },
    {
      image: 'https://images.unsplash.com/photo-1577896851905-dc92e37a6a0e?w=600&h=600&fit=crop',
      caption: 'Tutor ke Rumah'
    },
    {
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=600&fit=crop',
      caption: 'Diskusi Kelompok'
    },
    {
      image: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=600&h=600&fit=crop',
      caption: 'Kelas Interaktif'
    },
    {
      image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=600&fit=crop',
      caption: 'Belajar Mandiri'
    }
  ];

  // Split into groups of 4
  const totalSlides = Math.ceil(allActivities.length / 4);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentActivities = () => {
    const start = currentSlide * 4;
    return allActivities.slice(start, start + 4);
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-sm text-primary font-medium">Aktivitas</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kegiatan Belajar Mengajar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lihat suasana belajar di Bimbel Saka
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {getCurrentActivities().map((activity, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-muted">
                  <ImageWithFallback
                    src={activity.image}
                    alt={activity.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium text-sm">{activity.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
