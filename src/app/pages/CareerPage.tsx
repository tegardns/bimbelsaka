import { useState } from "react";
import {
  Users,
  Award,
  TrendingUp,
  Heart,
  CheckCircle,
  Briefcase,
  Plus,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL belum diset di .env.local");
}

type TutorFormData = {
  name: string;
  email: string;
  phone: string;
  education: string;
  subject: string;
  experience: string;
  teachingLevel: string;
  referralSource: string;
  referralFriendName: string;
  referralOther: string;
  address: string;
  cvFile: File | null;
  transcriptFile: File | null;
};

export function CareerPage() {
  const [formData, setFormData] = useState<TutorFormData>({
    name: "",
    email: "",
    phone: "",
    education: "",
    subject: "",
    experience: "",
    teachingLevel: "",
    referralSource: "",
    referralFriendName: "",
    referralOther: "",
    address: "",
    cvFile: null,
    transcriptFile: null,
  });

  const [formResetKey, setFormResetKey] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = <K extends keyof TutorFormData>(
    key: K,
    value: TutorFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (
        formData.referralSource === "Teman" &&
        !formData.referralFriendName.trim()
      ) {
        throw new Error("Nama teman wajib diisi kalau sumbernya dari Teman.");
      }

      if (
        formData.referralSource === "Lainnya" &&
        !formData.referralOther.trim()
      ) {
        throw new Error(
          "Kolom keterangan wajib diisi kalau sumbernya Lainnya.",
        );
      }

      if (!formData.address.trim()) {
        throw new Error("Alamat wajib diisi.");
      }

      if (!formData.cvFile) {
        throw new Error("CV wajib diupload.");
      }

      if (!formData.transcriptFile) {
        throw new Error("Transkrip nilai wajib diupload.");
      }

      if (formData.cvFile.type !== "application/pdf") {
        throw new Error("CV harus berformat PDF.");
      }

      if (formData.transcriptFile.type !== "application/pdf") {
        throw new Error("Transkrip harus berformat PDF.");
      }

      if (formData.cvFile.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran CV maksimal 5MB.");
      }

      if (formData.transcriptFile.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran transkrip maksimal 5MB.");
      }

      const phoneRegex = /^(08|628)[0-9]{8,13}$/;
      const onlyNumbers = formData.phone.replace(/\D/g, "");

      if (!phoneRegex.test(onlyNumbers)) {
        throw new Error("Nomor WhatsApp tidak valid.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        throw new Error("Email tidak valid.");
      }

      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", onlyNumbers);
      payload.append("education", formData.education.trim());
      payload.append("subject", formData.subject.trim());
      payload.append("teachingLevel", formData.teachingLevel);
      payload.append("experience", formData.experience.trim());
      payload.append("address", formData.address.trim());
      payload.append("referralSource", formData.referralSource);
      payload.append("referralFriendName", formData.referralFriendName.trim());
      payload.append("referralOther", formData.referralOther.trim());
      payload.append("cvFile", formData.cvFile);
      payload.append("transcriptFile", formData.transcriptFile);

      const response = await fetch(`${API_BASE_URL}/api/tutors`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal mengirim data pendaftaran tutor.",
        );
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        education: "",
        subject: "",
        experience: "",
        teachingLevel: "",
        referralSource: "",
        referralFriendName: "",
        referralOther: "",
        address: "",
        cvFile: null,
        transcriptFile: null,
      });

      setFormResetKey((prev) => prev + 1);
      setShowSuccessModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";

      setError(msg);

      toast.error(msg, {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Penghasilan Kompetitif",
      description:
        "Dapatkan penghasilan yang sesuai dengan dedikasi dan kompetensi kamu",
    },
    {
      icon: Heart,
      title: "Jadwal Fleksibel",
      description: "Atur jadwal mengajar sesuai ketersediaan waktu kamu",
    },
    {
      icon: Award,
      title: "Pelatihan Berkala",
      description:
        "Ikuti pelatihan dan pengembangan untuk meningkatkan kualitas mengajar",
    },
    {
      icon: Users,
      title: "Komunitas Tutor",
      description:
        "Bergabung dengan komunitas tutor profesional dan saling berbagi pengalaman",
    },
  ];

  const requirements = [
    "Pendidikan D3/S1/Mahasiswa minimal semester 3",
    "Menguasai mata pelajaran yang akan diajarkan",
    "Mampu berkomunikasi dengan baik",
    "Memiliki kendaraan pribadi",
    "Sabar dan telaten dalam mengajar",
    "Komitmen terhadap jadwal mengajar",
    "Domisili di Purbalingga atau sekitarnya",
  ];

  const positions = [
    {
      title: "Tutor Calistung",
      subjects: "Membaca, Menulis, Berhitung",
      level: "Usia 4-7 tahun",
      slots: "Hiring",
    },
    {
      title: "Tutor SD",
      subjects: "Semua Mata Pelajaran",
      level: "Kelas 1-6",
      slots: "Hiring",
    },
    {
      title: "Tutor SMP",
      subjects: "Matematika, IPA, Bahasa Inggris",
      level: "Kelas 7-9",
      slots: "Hiring",
    },
    {
      title: "Tutor SMA",
      subjects: "Matematika, Fisika, Kimia, Bahasa Inggris",
      level: "Kelas 10-12 & UTBK",
      slots: "Coming Soon",
    },
  ];

  const tutorFaqs = [
    {
      question: "Bagaimana sistem pembayaran untuk tutor?",
      answer:
        "Pembayaran dilakukan setiap akhir bulan berdasarkan jumlah pertemuan yang telah dilakukan. Besaran fee disesuaikan dengan jenjang yang diajarkan dan pengalaman tutor.",
    },
    {
      question: "Apakah harus bisa mengajar semua mata pelajaran?",
      answer:
        "Tidak harus. Kamu bisa mengajar sesuai dengan keahlian dan mata pelajaran yang kamu kuasai. Kami akan menyesuaikan dengan kebutuhan siswa.",
    },
    {
      question: "Berapa minimal jam mengajar per minggu?",
      answer:
        "Minimal 6 jam mengajar per minggu atau setara dengan 4 pertemuan. Namun jadwal dapat disesuaikan dengan kesepakatan.",
    },
    {
      question: "Apakah ada pelatihan untuk tutor baru?",
      answer:
        "Ya, setiap tutor baru akan mendapatkan pelatihan dasar tentang metode mengajar, pengelolaan kelas, dan standar operasional Bimbel Saka.",
    },
    {
      question: "Bagaimana jika berhalangan hadir mengajar?",
      answer:
        "Kamu harus memberitahu minimal H-1 agar kami dapat mengatur jadwal pengganti atau mengkomunikasikan dengan siswa.",
    },
    {
      question: "Apakah tutor mendapatkan materi/modul mengajar?",
      answer:
        "Ya, Untuk Calistung kami menyediakan modul pembelajaran dan worksheet yang bisa digunakan. Tutor juga diperbolehkan membuat materi sendiri yang disesuaikan dengan kebutuhan siswa.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bergabung Bersama Kami
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Jadilah bagian dari tim tutor profesional Bimbel Saka dan bantu
            siswa meraih prestasi terbaik mereka
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Keuntungan Menjadi Tutor
            </h2>
            <p className="text-lg text-muted-foreground">
              Dapatkan berbagai benefit menarik dengan bergabung bersama kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-secondary/20 to-white rounded-xl p-6 border border-border hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & Positions */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Syarat Menjadi Tutor
                </h2>
                <p className="text-muted-foreground">
                  Pastikan kamu memenuhi persyaratan berikut
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
                <div className="space-y-3">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Lowongan Tersedia
                </h2>
                <p className="text-muted-foreground">
                  Pilih posisi yang sesuai dengan keahlian kamu
                </p>
              </div>

              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 shadow-md border border-border hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground mb-1">
                            {position.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {position.subjects}
                          </p>
                          <p className="text-xs text-primary font-medium">
                            {position.level}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-xs font-medium whitespace-nowrap">
                        {position.slots}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for Tutors */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pertanyaan Seputar Menjadi Tutor
            </h2>
            <p className="text-lg text-muted-foreground">
              Jawaban untuk pertanyaan yang sering ditanyakan calon tutor
            </p>
          </div>

          <div className="space-y-4">
            {tutorFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openFaqIndex === index ? (
                      <Minus className="w-5 h-5 text-primary" />
                    ) : (
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Formulir Pendaftaran Tutor
            </h2>
            <p className="text-lg text-muted-foreground">
              Isi formulir di bawah ini untuk memulai proses pendaftaran
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <form
              key={formResetKey}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nama lengkap kamu"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@contoh.com"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      handleChange("phone", onlyNumbers);
                    }}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pendidikan Terakhir <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Pilih pendidikan</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mata Pelajaran yang Dikuasai{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="Contoh: Matematika, Fisika, Bahasa Inggris"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Level Mengajar <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.teachingLevel}
                    onChange={(e) =>
                      handleChange("teachingLevel", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Pilih level mengajar</option>
                    <option value="Calistung">Calistung</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  placeholder="Masukkan alamat calon tutor saat ini"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pengalaman Mengajar <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  rows={3}
                  placeholder="Ceritakan pengalaman mengajar kamu"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CV Terbaru <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      toast.error("CV harus berformat PDF");
                      e.currentTarget.value = "";
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran CV maksimal 5MB");
                      e.currentTarget.value = "";
                      return;
                    }

                    handleChange("cvFile", file);
                  }}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Format PDF maksimal 5MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Transkrip Nilai <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      toast.error("Transkrip harus berformat PDF");
                      e.currentTarget.value = "";
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran transkrip maksimal 5MB");
                      e.currentTarget.value = "";
                      return;
                    }

                    handleChange("transcriptFile", file);
                  }}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Format PDF maksimal 5MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dari mana dapat info Les ini?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.referralSource}
                  onChange={(e) =>
                    handleChange("referralSource", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Pilih sumber informasi</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Tiktok">Tiktok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Threads">Threads</option>
                  <option value="X">X</option>
                  <option value="Teman">Teman</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {formData.referralSource === "Teman" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nama Teman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referralFriendName}
                    onChange={(e) =>
                      handleChange("referralFriendName", e.target.value)
                    }
                    placeholder="Masukkan nama teman"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {formData.referralSource === "Lainnya" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sebutkan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referralOther}
                    onChange={(e) =>
                      handleChange("referralOther", e.target.value)
                    }
                    placeholder="Dari mana Anda mendapatkan informasi?"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Lamaran"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h3 className="mb-3 text-center text-2xl font-bold text-foreground">
              Pendaftaran Berhasil 🎉
            </h3>

            <p className="mb-6 text-center text-muted-foreground">
              Data pendaftaran tutor kamu sudah berhasil dikirim.
              <br />
              Mohon tunggu admin menghubungi melalui WhatsApp untuk proses
              selanjutnya.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-xl bg-accent px-6 py-3 font-medium text-white transition-all hover:bg-accent/90"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
