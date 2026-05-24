import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { track } from "@vercel/analytics";
import { trackEvent } from "../../lib/analytics";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL belum diset di .env.local");
}

type City = "Purbalingga" | "Purwokerto";

type District = {
  name: string;
  distanceKm: number;
  available: boolean;
};

const SakaLocationPopup = ({
  onClose,
  onRequestOpen,
}: {
  onClose?: () => void;
  onRequestOpen?: (openFn: () => void) => void;
}) => {
  const [step, setStep] = useState<
    "city" | "check" | "available" | "unavailable" | "success"
  >("city");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimateOut, setIsAnimateOut] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );

  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("");

  // Form States pendaftaran siswa
  const [studentName, setStudentName] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      track("popup_location_open");
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const resetPopupState = () => {
    setStep("city");
    setSelectedCity(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSearchTerm("");
    setLevel("");
    setStudentName("");
    setStudentAddress("");
    setSelectedClass("");
    setSelectedSubject("");
    setIsOpenDropdown(false);
    setLoading(false);
    setLoadingDistricts(false);
  };

  const handleOpen = () => {
    resetPopupState();
    setIsMinimized(false);
    setIsAnimateOut(false);
    setIsVisible(true);
  };

  // Expose handleOpen ke parent (HomePage) lewat onRequestOpen
  useEffect(() => {
    onRequestOpen?.(handleOpen);
  }, []);

  const handleMinimize = () => {
    setIsAnimateOut(true);
    setTimeout(() => {
      resetPopupState();
      setIsMinimized(true);
      setIsAnimateOut(false);
      onClose?.();
    }, 400);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCity || step !== "check") {
        setDistricts([]);
        return;
      }
      try {
        setLoadingDistricts(true);
        const response = await fetch(
          `${API_BASE_URL}/api/coverage/districts?city=${selectedCity}`,
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.message || "Gagal mengambil data kecamatan");
        }
        setDistricts(result.data || []);
      } catch (err) {
        console.error(err);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedCity, step]);

  const filteredDistricts = districts
    .filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const handleCheckLocation = async () => {
    if (!selectedCity || !selectedDistrict || !level) return;

    trackEvent("klik_cek_lokasi", "popup_lokasi", selectedDistrict?.name);

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/coverage/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          district: selectedDistrict.name,
          level,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal cek lokasi");
      }

      if (result.data?.available) {
        track("location_available", {
          city: selectedCity,
          district: selectedDistrict.name,
          level,
        });
        setStep("available");
      } else {
        track("location_unavailable", {
          city: selectedCity,
          district: selectedDistrict.name,
          level,
        });
        setStep("unavailable");
      }
    } catch (err) {
      console.error(err);
      track("location_check_error", {
        city: selectedCity,
        district: selectedDistrict?.name || "",
        level,
      });
      alert("Gagal cek lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!studentName || !studentAddress || !selectedClass) {
      alert("Mohon lengkapi semua field pendaftaran.");
      return;
    }

    if (level !== "Calistung" && !selectedSubject) {
      alert("Mohon pilih mata pelajaran terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      track("quick_register_submit", {
        city: selectedCity || "",
        district: selectedDistrict?.name || "",
        level,
        class: selectedClass,
        subject: level === "Calistung" ? "Calistung" : selectedSubject,
      });

      const response = await fetch(`${API_BASE_URL}/api/quick-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          district: selectedDistrict?.name,
          level,
          studentName,
          studentAddress,
          classOrAge: selectedClass,
          subject: level === "Calistung" ? null : selectedSubject,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menyimpan data");
      }

      track("quick_register_success", {
        city: selectedCity || "",
        district: selectedDistrict?.name || "",
        level,
      });

      const adminNumber = "62895357409769";

      let messageText =
        `Halo Kak Melly! Saya mau mendaftar Les Privat.%0A%0A` +
        `📝 *DATA PENDAFTARAN SISWA:*%0A` +
        `• Nama Siswa: ${studentName}%0A` +
        `• Kota/Kabupaten: ${selectedCity}%0A` +
        `• Kecamatan: ${selectedDistrict?.name}%0A` +
        `• Alamat Rumah: ${studentAddress}%0A` +
        `• Jenjang: ${level}%0A` +
        `• ${level === "Calistung" ? "Umur Anak" : "Kelas"}: ${selectedClass}`;

      if (level !== "Calistung") {
        messageText += `%0A• Mata Pelajaran: ${selectedSubject}`;
      }

      window.open(
        `https://api.whatsapp.com/send?phone=${adminNumber}&text=${messageText}`,
        "_blank",
      );

      handleMinimize();
    } catch (err) {
      console.error(err);

      track("quick_register_error", {
        city: selectedCity || "",
        district: selectedDistrict?.name || "",
        level,
      });

      alert("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const renderClassOptions = () => {
    if (level === "Calistung") {
      return ["4 Tahun", "5 Tahun", "6 Tahun", "7 Tahun"].map((age) => (
        <option key={age} value={age}>
          {age}
        </option>
      ));
    } else if (level === "SD") {
      return [
        "Kelas 1",
        "Kelas 2",
        "Kelas 3",
        "Kelas 4",
        "Kelas 5",
        "Kelas 6",
      ].map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ));
    } else if (level === "SMP") {
      return ["Kelas 7", "Kelas 8", "Kelas 9"].map((cls) => (
        <option key={cls} value={cls}>
          {cls}
        </option>
      ));
    }
    return null;
  };

  const renderSubjectOptions = () => {
    if (level === "SD") {
      return ["Matematika", "Bahasa Inggris"].map((sub) => (
        <option key={sub} value={sub}>
          {sub}
        </option>
      ));
    } else if (level === "SMP") {
      return ["Matematika", "IPA", "Bahasa Inggris"].map((sub) => (
        <option key={sub} value={sub}>
          {sub}
        </option>
      ));
    }
    return null;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tombol minimized DIHAPUS — dihandle oleh HomePage */}

      {!isMinimized && (
        <>
          <div
            onClick={handleMinimize}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[99] transition-opacity duration-700 cursor-pointer ${
              isAnimateOut ? "opacity-0" : "opacity-100 animate-in fade-in"
            }`}
          />

          <div
            className={`fixed inset-x-0 bottom-0 z-[100] p-4 md:inset-auto md:left-6 md:bottom-6 md:p-0 md:w-[380px] transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
              isAnimateOut
                ? "translate-y-full opacity-0"
                : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-full"
            }`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative cursor-default"
            >
              <button
                onClick={handleMinimize}
                className="absolute right-6 top-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full z-20 transition-colors"
                aria-label="Minimize popup"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              <div className="h-2 bg-gradient-to-r from-[#0066FF] via-[#00CC99] to-[#0066FF]" />

              <div className="p-8 max-h-[85vh] overflow-y-auto hidden-scrollbar">
                {/* STEP CITY */}
                {step === "city" && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-3 animate-bounce shadow-sm shadow-blue-100">
                        <MapPin className="w-6 h-6 text-[#0066FF]" />
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                        Cek Ketersediaan Tutor
                      </h2>
                      <p className="text-[12px] text-slate-500 mt-1 font-medium">
                        Kamu di Purwokerto atau Purbalingga?
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 italic font-medium">
                        *Kami tidak menyimpan data pribadi Anda pada tahap ini.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(["Purbalingga", "Purwokerto"] as City[]).map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setSelectedDistrict(null);
                            setSearchTerm("");
                            setLevel("");
                            setStep("check");
                          }}
                          className="flex items-center justify-between w-full p-4 text-sm font-bold border border-slate-200 rounded-2xl hover:border-[#0066FF] hover:bg-blue-50/50 transition-all group"
                        >
                          <span className="text-slate-700 group-hover:text-[#0066FF]">
                            {city}
                          </span>
                          <ChevronDown className="w-4 h-4 -rotate-90 text-slate-300 group-hover:text-[#0066FF]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP CHECK */}
                {step === "check" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button
                      onClick={() => {
                        setStep("city");
                        setSelectedCity(null);
                        setSelectedDistrict(null);
                        setSearchTerm("");
                        setLevel("");
                        setIsOpenDropdown(false);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#0066FF] transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" /> Kembali
                    </button>

                    <div className="text-center md:text-left">
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
                        Kecamatan di {selectedCity}
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Cari Kecamatan
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm flex justify-between items-center cursor-pointer hover:border-[#0066FF] transition-all"
                          >
                            <span
                              className={
                                selectedDistrict
                                  ? "text-slate-800 font-medium"
                                  : "text-slate-400"
                              }
                            >
                              {selectedDistrict
                                ? selectedDistrict.name
                                : loadingDistricts
                                  ? "Memuat..."
                                  : "Pilih Kecamatan..."}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${isOpenDropdown ? "rotate-180" : ""}`}
                            />
                          </div>

                          {isOpenDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <div className="p-2 border-b border-slate-50">
                                <div className="relative">
                                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Ketik nama kecamatan..."
                                    className="w-full bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                                    value={searchTerm}
                                    onChange={(e) =>
                                      setSearchTerm(e.target.value)
                                    }
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                                {filteredDistricts.length > 0 ? (
                                  filteredDistricts.map((d) => (
                                    <div
                                      key={d.name}
                                      onClick={() => {
                                        setSelectedDistrict(d);
                                        setIsOpenDropdown(false);
                                        setSearchTerm("");
                                      }}
                                      className="flex justify-between items-center px-3 py-2.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                                    >
                                      <span className="text-sm text-slate-700 group-hover:text-[#0066FF] font-medium">
                                        {d.name}
                                      </span>
                                      <span className="text-[10px] text-slate-300 group-hover:text-blue-300 font-bold uppercase">
                                        {d.distanceKm} KM
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-xs text-slate-400 font-medium italic">
                                    Lokasi tidak ditemukan...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Jenjang Pendidikan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Calistung", "SD", "SMP"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setLevel(item);
                                setSelectedClass("");
                                setSelectedSubject("");
                              }}
                              className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${level === item ? "bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-blue-100" : "bg-white text-slate-600 border-slate-200 hover:border-[#0066FF]"}`}
                            >
                              {item}
                            </button>
                          ))}
                          <button
                            disabled
                            className="py-2.5 text-xs font-bold rounded-xl border border-slate-100 bg-slate-50 text-slate-300 flex items-center justify-center gap-1 cursor-not-allowed"
                          >
                            SMA{" "}
                            <span className="text-[8px] bg-slate-200 px-1 rounded-sm text-slate-500 font-medium uppercase">
                              Soon
                            </span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckLocation}
                        disabled={!selectedDistrict || !level || loading}
                        className="w-full bg-[#00CC99] hover:bg-[#00B88A] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#00CC99]/20 active:scale-95"
                      >
                        {loading ? "Mengecek..." : "Cek Lokasi"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP AVAILABLE */}
                {step === "available" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center md:text-left border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#00CC99]" />{" "}
                        Tutor Tersedia!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Silakan lengkapi data untuk Daftar Cepat
                      </p>
                    </div>

                    <div className="space-y-3.5 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Nama Siswa
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan nama calon siswa"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0066FF] transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Alamat Rumah
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Nama jalan, RT/RW, nomor rumah"
                          value={studentAddress}
                          onChange={(e) => setStudentAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0066FF] transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          {level === "Calistung"
                            ? "Pilih Umur Anak"
                            : `Pilih Kelas Saat Ini (${level})`}
                        </label>
                        <div className="relative">
                          <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0066FF] appearance-none transition-all cursor-pointer"
                          >
                            <option value="">-- Pilih Opsi --</option>
                            {renderClassOptions()}
                          </select>
                          <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {level !== "Calistung" && (
                        <div className="space-y-1 animate-in fade-in duration-300">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Mapel Yang Ingin Diikuti
                          </label>
                          <div className="relative">
                            <select
                              value={selectedSubject}
                              onChange={(e) =>
                                setSelectedSubject(e.target.value)
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0066FF] appearance-none transition-all cursor-pointer"
                            >
                              <option value="">
                                -- Pilih Mata Pelajaran --
                              </option>
                              {renderSubjectOptions()}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleSubmitRequest}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 mt-2 active:scale-95"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {loading ? "Mengirim..." : "Daftar Cepat"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP UNAVAILABLE */}
                {step === "unavailable" && (
                  <div className="text-center space-y-6 py-2 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-orange-500">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">
                        Belum Tersedia
                      </h3>
                      <p className="text-sm text-slate-500 px-4 leading-relaxed">
                        Mohon maaf saat ini lokasi{" "}
                        <span className="font-bold">
                          {selectedDistrict?.name}
                        </span>{" "}
                        tutor belum tersedia.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={() => {
                          setStep("city");
                          setSelectedCity(null);
                          setSelectedDistrict(null);
                          setSearchTerm("");
                          setLevel("");
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl transition-all active:scale-95 border border-slate-200"
                      >
                        Cek Wilayah Lain
                      </button>
                      <div className="relative">
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                          <span className="bg-white px-2 text-slate-300">
                            Atau
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const adminNumber = "62895357409769";
                          const message = `Halo Admin Saka! Lokasi saya di ${selectedDistrict?.name} (${selectedDistrict?.distanceKm}km) saat ini belum terjangkau sistem. Apakah tetap bisa dibantu untuk tutor ke sini?`;
                          window.open(
                            `https://api.whatsapp.com/send?phone=${adminNumber}&text=${encodeURIComponent(message)}`,
                            "_blank",
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 text-primary font-bold text-sm hover:underline py-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Request untuk Wilayah Ini
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SakaLocationPopup;
