import { useState } from "react";
import { FAQ } from "../components/FAQ";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL belum diset di .env.local");
}

type FormData = {
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  address: string;
  grade: string;
  program: string;
  method: string;
  subjects: string;
  notes: string;
  referralSource: string;
  referralFriendName: string;
  referralOther: string;
};

export function RegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    parentName: "",
    phone: "",
    email: "",
    address: "",
    grade: "",
    program: "",
    method: "",
    subjects: "",
    notes: "",
    referralSource: "",
    referralFriendName: "",
    referralOther: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

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

      const phoneRegex = /^(08|\+628|628)[0-9]{8,13}$/;

      if (!phoneRegex.test(formData.phone)) {
        throw new Error("Nomor WhatsApp tidak valid.");
      }

      const payload = {
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        grade: formData.grade,
        program: formData.program,
        method: formData.method,
        subjects: formData.subjects.trim(),
        notes: formData.notes.trim(),
        referralSource: formData.referralSource,
        referralFriendName: formData.referralFriendName.trim(),
        referralOther: formData.referralOther.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Gagal mengirim data pendaftaran.");
      }

      setShowSuccessModal(true);

      setFormData({
        studentName: "",
        parentName: "",
        phone: "",
        email: "",
        address: "",
        grade: "",
        program: "",
        method: "",
        subjects: "",
        notes: "",
        referralSource: "",
        referralFriendName: "",
        referralOther: "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 pt-28 pb-16 md:pt-40 md:pb-28 relative overflow-hidden">
        {/* Pattern Overlays */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
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
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.6) 49%, rgba(255,255,255,0.6) 51%, transparent 52%)",
            backgroundSize: "48px 48px",
          }}
        ></div>

        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
          {/* Heading dengan fluid font size */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Daftar Les Sekarang
          </h1>

          {/* Subtitle dengan max-width yang terjaga di desktop agar tidak terlalu panjang per barisnya */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-2">
            Mulai perjalanan belajar kamu bersama tutor profesional Bimbel Saka
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Formulir Pendaftaran Siswa
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Isi data dengan lengkap untuk memproses pendaftaran kamu
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
            {message && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nama Siswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) =>
                      handleChange("studentName", e.target.value)
                    }
                    placeholder="Nama lengkap siswa"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nama Orang Tua/Wali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => handleChange("parentName", e.target.value)}
                    placeholder="Nama orang tua/wali"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nomor WA Aktif <span className="text-red-500">*</span>
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@contoh.com (opsional)"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  placeholder="Alamat lengkap di Purbalingga/Purwokerto"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kelas/Tingkat <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Pilih kelas</option>
                    <option value="Calistung">
                      Calistung (Usia 4-7 tahun)
                    </option>
                    <option value="SD Kelas 1">SD Kelas 1</option>
                    <option value="SD Kelas 2">SD Kelas 2</option>
                    <option value="SD Kelas 3">SD Kelas 3</option>
                    <option value="SD Kelas 4">SD Kelas 4</option>
                    <option value="SD Kelas 5">SD Kelas 5</option>
                    <option value="SD Kelas 6">SD Kelas 6</option>
                    <option value="SMP Kelas 7">SMP Kelas 7</option>
                    <option value="SMP Kelas 8">SMP Kelas 8</option>
                    <option value="SMP Kelas 9">SMP Kelas 9</option>
                    <option value="SMA Kelas 10">SMA Kelas 10</option>
                    <option value="SMA Kelas 11">SMA Kelas 11</option>
                    <option value="SMA Kelas 12">SMA Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.program}
                    onChange={(e) => handleChange("program", e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Pilih program</option>
                    <option value="Calistung">Calistung</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Metode Belajar <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => handleChange("method", e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Pilih metode</option>
                  <option value="Tutor ke Rumah">Tutor ke Rumah</option>
                  <option value="Les Online">Les Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mata Pelajaran yang Ingin Dipelajari
                </label>
                <input
                  type="text"
                  value={formData.subjects}
                  onChange={(e) => handleChange("subjects", e.target.value)}
                  placeholder="Contoh: Matematika, Bahasa Inggris, IPA"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  placeholder="Ada yang ingin kamu sampaikan? (opsional)"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
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
                {loading ? "Mengirim..." : "Daftar Sekarang"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <FAQ />

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
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
              Data pendaftaran kamu sudah berhasil dikirim.
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
