import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Methods } from "../components/Methods";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { Pricing } from "../components/Pricing";
import { HowToRegister } from "../components/HowToRegister";
import { FAQ } from "../components/FAQ";
// import { Activities } from "../components/Activities";
import { Contact } from "../components/Contact";

import { MessageCircle } from "lucide-react";

// Import logo WhatsApp (ganti path-nya sesuaikan dengan letak file gambarnya)
import WhatsappLogo from "../../../assets/whatsapp.svg";

export function HomePage() {
  const whatsappNumber = "62895357409769"; // GANTI nomor admin
  const whatsappMessage =
    "Halo Admin Bimbel Saka, saya ingin bertanya mengenai layanan les.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <>
      <Hero />
      <Services />
      <Methods />
      <WhyChooseUs />
      <Pricing />
      <HowToRegister />
      <FAQ />
      {/* <Activities /> */}
      <Contact />

      {/* Floating WhatsApp Button */}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        // Tambahkan transisi yang halus
        className="fixed bottom-6 right-6 z-50 flex h-18 w-18 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {/* Tampilkan logo WhatsApp sebagai image */}
        <img src={WhatsappLogo} alt="WhatsApp" className="h-10 w-10" />

        {/* Tambahkan animasi pulsate pada hover (contoh dengan CSS pseudo-element) */}
        <style jsx>{`
          .fixed:hover::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: rgba(
              72,
              187,
              120,
              0.4
            ); /* Warna latar yang sama dengan opasitas */
            animation: pulsate 1s infinite;
          }

          @keyframes pulsate {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.4);
              opacity: 0;
            }
          }
        `}</style>
      </a>
    </>
  );
}
