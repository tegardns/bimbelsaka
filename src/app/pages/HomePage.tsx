import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Methods } from "../components/Methods";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { Pricing } from "../components/Pricing";
import { HowToRegister } from "../components/HowToRegister";
import { FAQ } from "../components/FAQ";
import { Contact } from "../components/Contact";
import SakaLocationPopup from "../components/PopupLokasi";

// Import logo WhatsApp
import WhatsappLogo from "../../../assets/whatsapp.svg";

export function HomePage() {
  const whatsappNumber = "62895357409769";
  const whatsappMessage =
    "Halo Admin Bimbel Saka, saya ingin bertanya mengenai layanan les.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <SakaLocationPopup />
      <Hero />
      <Services />
      <Methods />
      <WhyChooseUs />
      <Pricing />
      <HowToRegister />
      <FAQ />
      <Contact />

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        // Pakai class unik 'wa-float' supaya tidak tabrakan dengan navbar
        className="wa-float fixed bottom-6 right-6 z-50 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
      >
        <img
          src={WhatsappLogo}
          alt="WhatsApp"
          className="h-8 w-8 md:h-10 md:w-10 object-contain"
        />

        <style jsx>{`
          /* Animasi khusus hanya untuk elemen dengan class wa-float */
          .wa-float:hover::after {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: rgba(37, 211, 102, 0.4);
            animation: pulsate-wa 1.2s infinite;
          }

          @keyframes pulsate-wa {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          /* Animasi goyang tipis saat idle */
          .wa-float {
            animation: floating-wa 3s ease-in-out infinite;
          }

          @keyframes floating-wa {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </a>
    </>
  );
}
