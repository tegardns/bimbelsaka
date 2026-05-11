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
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-all hover:scale-110 hover:bg-green-600"
      >
        <MessageCircle className="h-8 w-8" />
      </a>
    </>
  );
}
