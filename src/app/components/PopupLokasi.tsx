import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL belum diset di .env.local");
}

const DISTRICTS_DATA = [
  { name: "Purbalingga", distance: 0.5 },
  { name: "Kalimanah", distance: 3.2 },
  { name: "Padamara", distance: 4.1 },
  { name: "Bojongsari", distance: 4.8 },
  { name: "Kutasari", distance: 4.9 },
  { name: "Mrebet", distance: 8.5 },
  { name: "Bukateja", distance: 10.2 },
  { name: "Kaligondang", distance: 7.4 },
  { name: "Kejobong", distance: 15.6 },
  { name: "Kemangkon", distance: 12.1 },
  { name: "Kertanegara", distance: 18.3 },
  { name: "Karanganyar", distance: 20.1 },
  { name: "Karangmoncol", distance: 24.5 },
  { name: "Karangreja", distance: 28.0 },
  { name: "Karangjambu", distance: 32.0 },
  { name: "Bobotsari", distance: 14.2 },
  { name: "Pengadegan", distance: 16.5 },
  { name: "Rembang", distance: 26.0 },
];

const SakaLocationPopup = () => {
  const [step, setStep] = useState<"check" | "available" | "unavailable">(
    "check",
  );

  // State untuk delay muncul dan kontrol animasi keluar
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimateOut, setIsAnimateOut] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    name: string;
    distance: number;
  } | null>(null);
  const [level, setLevel] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Efek Delay Muncul 0.7 detik pertama kali
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Fungsi Close dengan animasi slide-down
  const handleMinimize = () => {
    setIsAnimateOut(true);
    setTimeout(() => {
      setIsMinimized(true);
      setIsAnimateOut(false);
    }, 600);
  };

  // Fungsi Buka kembali (Reset semua data & step ke awal)
  const handleOpen = () => {
    setStep("check");
    setSelectedDistrict(null);
    setLevel("");
    setWaNumber("");
    setSearchTerm("");
    setIsMinimized(false);
    setIsAnimateOut(false);
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

  const filteredDistricts = DISTRICTS_DATA.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ).sort((a, b) => a.distance - b.distance);

  const handleCheckLocation = async () => {
    if (!selectedDistrict || !level) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coverage/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district: selectedDistrict.name, level }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Gagal cek lokasi");
      if (result.available) {
        setStep("available");
      } else {
        setStep("unavailable");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal cek lokasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      if (!waNumber) {
        alert("Nomor WA wajib diisi");
        return;
      }
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coverage/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waNumber,
          district: selectedDistrict?.name,
          level,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message || "Gagal kirim request");
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim request");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {isMinimized && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-6 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl border border-slate-200 transition-all hover:scale-110 hover:border-[#0066FF] animate-in fade-in zoom-in duration-500"
          aria-label="Buka cek lokasi"
        >
          <MapPin className="h-6 w-6 !text-white" />
        </button>
      )}

      {!isMinimized && (
        <>
          {/* Backdrop: Klik area luar untuk close */}
          <div
            onClick={handleMinimize}
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[99] transition-opacity duration-700 cursor-pointer ${
              isAnimateOut ? "opacity-0" : "opacity-100 animate-in fade-in"
            }`}
          />

          {/* Container Popup dengan Animasi Slide */}
          <div
            className={`fixed inset-x-0 bottom-0 z-[100] p-4 md:inset-auto md:left-6 md:bottom-6 md:p-0 md:w-[380px] transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
              isAnimateOut
                ? "translate-y-full opacity-0"
                : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-full"
            }`}
          >
            {/* Card Content: e.stopPropagation agar klik di dalam card tidak mentrigger close */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative cursor-default"
            >
              <button
                onClick={handleMinimize}
                className="absolute right-6 top-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full z-20 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              <div className="h-2 bg-gradient-to-r from-[#0066FF] via-[#00CC99] to-[#0066FF]" />

              <div className="p-8">
                {step === "check" && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-3 animate-bounce shadow-sm shadow-blue-100">
                        <MapPin className="w-6 h-6 text-[#0066FF]" />
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                        Cek Ketersediaan Tutor
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-1 italic font-medium">
                        *Kami tidak menyimpan data pribadi Anda pada tahap ini.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Kecamatan (Kab. Purbalingga)
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
                                : "Cari Lokasi..."}
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
                                        {d.distance} KM
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
                              onClick={() => setLevel(item)}
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

                {step === "available" && (
                  <div className="text-center space-y-6 py-2 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-[#00CC99] animate-pulse">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Tutor Tersedia!
                      </h3>
                      <p className="text-sm text-slate-500">
                        Yay🎉 Tutor Tersedia di Wilayah{" "}
                        <span className="font-bold text-[#0066FF]">
                          {selectedDistrict?.name}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-3 pt-2 text-left">
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400">
                          +62
                        </span>
                        <input
                          type="tel"
                          placeholder="812xxxxxxx"
                          value={waNumber}
                          onChange={(e) =>
                            setWaNumber(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-14 pr-4 text-sm outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#00CC99] transition-all"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                          Masukkan nomor WA aktif untuk terhubung dengan admin
                        </p>
                      </div>
                      <button
                        onClick={handleSubmitRequest}
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-slate-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {loading ? "Mengirim..." : "Kirim"}
                      </button>
                    </div>
                  </div>
                )}

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
                        Mohon maaf saaat ini lokasi{" "}
                        <span className="font-bold">
                          {selectedDistrict?.name}
                        </span>{" "}
                        tutor belum tersedia{" "}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={() => {
                          setStep("check");
                          setSelectedDistrict(null);
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
                          const message = `Halo Admin Saka! Lokasi saya di ${selectedDistrict?.name} (${selectedDistrict?.distance}km) saat ini belum terjangkau sistem. Apakah tetap bisa dibantu untuk tutor ke sini?`;
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

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="mb-3 text-center text-2xl font-bold text-slate-800">
              Request Terkirim 🎉
            </h3>
            <p className="mb-6 text-center text-slate-500">
              Admin akan segera menghubungi terkait ketersediaan tutor.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full rounded-xl bg-[#00CC99] px-6 py-3 font-medium text-white transition-all hover:bg-[#00B88A]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SakaLocationPopup;
