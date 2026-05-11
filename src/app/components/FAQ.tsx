import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Bagaimana cara mendaftar di Bimbel Saka?",
      answer:
        'Kamu bisa mendaftar melalui tombol "Daftar Sekarang" yang ada di website kami atau langsung menghubungi kami via WhatsApp. Tim kami akan membantu proses pendaftaran dan konsultasi program yang sesuai.',
    },
    {
      question: "Apakah biaya transport tutor sudah termasuk dalam harga?",
      answer:
        "Ya, semua biaya transport tutor sudah termasuk dalam harga yang tertera. Kamu tidak perlu membayar biaya tambahan apapun.",
    },
    {
      question: "Berapa minimal pertemuan dalam seminggu?",
      answer:
        "Minimal 2 kali pertemuan dalam seminggu. Namun, jadwal dapat disesuaikan dengan kebutuhan dan kesepakatan bersama tutor.",
    },
    {
      question: "Apakah tersedia les online?",
      answer:
        "Ya, kami menyediakan metode les online via Zoom atau Google Meet. Metode pembelajaran tetap interaktif dan efektif seperti les tatap muka.",
    },
    {
      question: "Bagaimana sistem pembayaran di Bimbel Saka?",
      answer:
        "Pembayaran dilakukan per bulan dengan sistem transfer atau tunai. Detail pembayaran akan dijelaskan saat proses pendaftaran.",
    },
    {
      question: "Apakah bisa request tutor tertentu?",
      answer:
        "Tentu! Kamu bisa merequest tutor berdasarkan preferensi seperti gender, pengalaman, atau spesialisasi mata pelajaran tertentu.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-sm text-primary font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-muted-foreground">
            Temukan jawaban untuk pertanyaan umum seputar Bimbel Saka
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">
            Masih ada pertanyaan?
          </h3>
          <p className="text-muted-foreground mb-4">
            Hubungi kami melalui WhatsApp untuk informasi lebih lanjut
          </p>
          <button
            onClick={() =>
              window.open(
                "https://api.whatsapp.com/send/?phone=62895357409769&text&type=phone_number&app_absent=0",
                "_blank",
              )
            }
            className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30"
          >
            Hubungi Kami
          </button>
        </div>
      </div>
    </section>
  );
}
