import { useState, useRef } from "react";
import { Brain, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Methods } from "../components/Methods";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { Pricing } from "../components/Pricing";
import { HowToRegister } from "../components/HowToRegister";
import { FAQ } from "../components/FAQ";
import { Contact } from "../components/Contact";
import SakaLocationPopup from "../components/PopupLokasi";
import AISakaButton from "../components/AISaka/AISakaButton";

// Impor logo WhatsApp dari folder assets Anda
import LogoWhatsApp from "../../../assets/whatsapp.svg";

export function HomePage() {
  const [lokasiClosed, setLokasiClosed] = useState(false);
  const openLokasiRef = useRef<(() => void) | null>(null);
  const navigate = useNavigate();

  const WHATSAPP_LINK =
    "https://wa.me/62895357409769?text=Halo%20Kak%20Melly,%20saya%20mau%20tanya%20informasi%20pendaftaran...";

  return (
    <>
      <Hero />
      <Services />
      <Methods />
      <WhyChooseUs />
      <div id="harga" className="scroll-mt-20">
        <Pricing />
      </div>
      <HowToRegister />
      <FAQ />
      <Contact />

      {/* Popup Lokasi */}
      <SakaLocationPopup
        onClose={() => setLokasiClosed(true)}
        onRequestOpen={(fn) => {
          openLokasiRef.current = fn;
        }}
      />

      {/* Floating buttons — Muncul rata kanan setelah popup lokasi ditutup */}
      {lokasiClosed && (
        <div className="fixed bottom-6 right-6 z-[108] flex flex-col items-end gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 1. Button Lokasi */}
          <button
            onClick={() => {
              setLokasiClosed(false);
              openLokasiRef.current?.();
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl border border-slate-200 transition-all hover:scale-110 hover:border-[#0066FF] animate-in fade-in zoom-in duration-500"
            aria-label="Cek ketersediaan tutor"
            title="Cek Ketersediaan Tutor"
          >
            <MapPin className="h-6 w-6 text-white" />
          </button>

          {/* 2. Button WhatsApp dengan Logo dari Assets */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-2xl transition-all hover:scale-110 hover:bg-[#20ba5a] animate-in fade-in zoom-in duration-500"
            aria-label="Hubungi Admin via WhatsApp"
            title="Hubungi Admin"
          >
            <img
              src={LogoWhatsApp}
              alt="WhatsApp"
              className="h-7 w-7 object-contain select-none"
            />
          </a>

          {/* 3. Button AI / Tanya PR */}
          <AISakaButton />

          {/* 4. Shortcut Tes Logika */}
          <button
            onClick={() => navigate("/tes-logika")}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#0066FF] shadow-2xl transition-all hover:scale-105 active:scale-95"
            aria-label="Buka Tes Logika"
            title="Tes Logika"
          >
            <Brain className="h-4 w-4" />
            Tes Logika
          </button>
        </div>
      )}
    </>
  );
}
