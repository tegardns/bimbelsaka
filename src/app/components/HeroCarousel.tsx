import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Slide1 from "../../../assets/5.webp";
import Slide2 from "../../../assets/6.webp";
import Slide3 from "../../../assets/7.webp";
import Slide4 from "../../../assets/8.webp";

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: Slide1,
      alt: "Les Calistung",
    },
    {
      image: Slide2,
      alt: "Privat SD",
    },
    {
      image: Slide3,
      alt: "Privat SMP",
    },
    {
      image: Slide4,
      alt: "Privat SMA",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl transform rotate-6 transition-transform duration-700"></div>
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-3xl transform -rotate-3 transition-transform duration-700"></div>

      <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl h-full">
        <div className="relative h-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 transform ${
                index === currentSlide
                  ? "translate-x-0 opacity-100"
                  : index < currentSlide
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-10"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-10"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white shadow-lg"
                  : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
