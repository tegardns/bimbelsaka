import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=300&fit=crop',
      alt: 'Promo Diskon Spesial'
    },
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=300&fit=crop',
      alt: 'Program Belajar Terbaik'
    },
    {
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=300&fit=crop',
      alt: 'Les Privat Berkualitas'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative pt-6 w-full mb-4 md:hidden">
      <div className="relative aspect-[3/1.5]  rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient untuk readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
          </div>
        ))}

        {/* Navigation buttons - subtle */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
