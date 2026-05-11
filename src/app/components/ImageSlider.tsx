import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Slide1 from "../../../assets/9.webp";
import Slide2 from "../../../assets/10.webp";
import Slide3 from "../../../assets/11.webp";

export function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: Slide1,
      alt: "Gratis Registrasi",
    },
    {
      image: Slide2,
      alt: "Bonus",
    },
    {
      image: Slide3,
      alt: "Bebas Request",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white shadow-lg"
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
