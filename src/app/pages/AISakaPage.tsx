import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Camera,
  Send,
  X,
  Sparkles,
  Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { trackEvent } from "../../lib/analytics";

import LogoAISaka from "../../../assets/LogoAISaka.svg";

// ─── Types ───────────────────────────────────────────────────────────────────
type Subject = "Matematika" | "Bahasa Inggris";
type MessageRole = "user" | "model";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  image?: string;
  isLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Deteksi iOS
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches;

// ─── Blink cursor component ───────────────────────────────────────────────────
const BlinkCursor = () => (
  <span className="inline-block w-[3px] h-5 bg-blue-400 ml-1 align-middle animate-pulse rounded-full" />
);

// ─── Loading dots ─────────────────────────────────────────────────────────────
const LoadingDots = () => (
  <div className="flex gap-1.5 items-center py-1 px-1">
    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:0ms]" />
    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:150ms]" />
    <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce [animation-delay:300ms]" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AISakaPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject>("Matematika");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // State untuk PWA Installer Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const [showIOSBanner, setShowIOSBanner] = useState(
    isIOS() && !isInStandaloneMode(),
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listener untuk mendeteksi apakah aplikasi bisa diinstal (PWA belum terinstal)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Cek apakah user pernah menutup banner ini sebelumnya di session ini
      const isBannerDismissed = sessionStorage.getItem("pwa_banner_dismissed");
      if (!isBannerDismissed) {
        setShowPwaBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Jika masuk dalam mode standalone (sudah terinstal), pastikan banner tersembunyi
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPwaBanner(false);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPwaBanner(false);
    }
  };

  const handleDismissPwaBanner = () => {
    setShowPwaBanner(false);
    sessionStorage.setItem("pwa_banner_dismissed", "true");
  };

  const handleSubjectChange = (s: Subject) => {
    if (s === subject) return;
    setSubject(s);
    setMessages([]);
    setHasInteracted(false);
    setImage(null);
    setInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2.5MB ya!");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Format foto harus JPG, PNG, atau WebP");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !image) return;
    if (loading) return;

    setHasInteracted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed || "📷 Foto soal",
      image: image || undefined,
    };

    const loadingMessage: Message = {
      id: "loading",
      role: "model",
      content: "",
      isLoading: true,
    };

    const capturedImage = image;
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setImage(null);
    setLoading(true);

    trackEvent("ai_saka_send", "ai_saka", subject);

    try {
      const historyMessages = [...messages, userMessage]
        .filter((m) => m.id !== "loading" && !m.isLoading)
        .map((m) => ({
          role: m.role,
          content:
            m.content === "📷 Foto soal" ? "Ini foto soal saya" : m.content,
        }));

      const body: Record<string, any> = { messages: historyMessages, subject };
      if (capturedImage) body.image = capturedImage;

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mendapat jawaban");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? {
                id: Date.now().toString(),
                role: "model" as MessageRole,
                content: data.data.answer,
              }
            : m,
        ),
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? {
                id: Date.now().toString(),
                role: "model" as MessageRole,
                content:
                  err.message || "Waduh ada gangguan nih 😅 Coba lagi ya!",
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setHasInteracted(false);
    setImage(null);
    setInput("");
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0a0f1a 70%, #080d14 100%)",
      }}
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #1a6cf6 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-6"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5">
        {/* Kiri: back button (Langsung memunculkan popup konfirmasi keluar) */}
        {!isStandalone ? (
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors p-2 -ml-2 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" /> // placeholder biar title tetap di tengah
        )}

        {/* Tengah: Title */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-white font-medium tracking-wide text-lg">
            <em>SakaAi</em>
          </span>
        </div>

        {/* Kanan: delete (Membersihkan obrolan jika ada pesan) */}
        <button
          onClick={() => {
            if (messages.length > 0) {
              handleClear();
            }
          }}
          disabled={messages.length === 0}
          className={`p-2 -mr-2 rounded-xl transition-all ${
            messages.length > 0
              ? "text-white/40 hover:text-white/80 hover:bg-white/5 cursor-pointer"
              : "text-white/10 cursor-not-allowed"
          }`}
          title="Hapus chat"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* ── PWA Notification Banner (Muncul di atas jika belum install) ── */}
      {showPwaBanner && (
        <div className="relative z-20 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border-b border-blue-500/20 backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <img
                src={LogoAISaka}
                alt="Saka Logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-white/90 text-xs font-medium">
                Akses Lebih Cepat & Ringan
              </p>
              <p className="text-white/40 text-[10px] font-light">
                Tambahkan Saka Ai ke layar utama kamu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePwaInstall}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={handleDismissPwaBanner}
              className="p-1.5 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── iOS Install Banner ── */}
      {showIOSBanner && (
        <div className="relative z-20 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border-b border-blue-500/20 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <img
                  src={LogoAISaka}
                  alt="Saka Logo"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-white/90 text-xs font-medium">
                  Tambahkan ke Homescreen
                </p>
                <p className="text-white/40 text-[10px] font-light leading-relaxed mt-0.5">
                  Tap tombol{" "}
                  <span className="inline-flex items-center gap-0.5 text-white/60 font-medium">
                    Bagikan
                  </span>{" "}
                  di Safari, lalu pilih{" "}
                  <span className="text-white/60 font-medium">
                    "Tambahkan ke Layar Utama"
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSBanner(false)}
              className="p-1.5 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Subject Toggle ── */}
      <div className="relative z-10 flex justify-center px-4 py-3">
        <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          {(["Matematika", "Bahasa Inggris"] as Subject[]).map((s) => (
            <button
              key={s}
              onClick={() => handleSubjectChange(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                subject === s
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 py-2 space-y-6"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Greeting — hanya muncul saat belum ada interaksi */}
        {!hasInteracted && (
          <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center px-6 animate-in fade-in duration-700">
            {/* Logo Saka Modern Tanpa Box & Dot Indikator */}
            <div className="mb-6 relative flex items-center justify-center">
              {/* Efek Pendaran Glow Lembut di Belakang Logo */}
              <div className="absolute w-20 h-20 bg-blue-500/10 rounded-full opacity-40 blur-xl animate-pulse" />

              {/* Logo dengan Animasi Mengambang yang Sangat Tipis & Lambat */}
              <img
                src={LogoAISaka}
                alt="AI Saka Logo"
                className="w-20 h-20 object-contain select-none animate-[smoothFloat_5s_infinite_ease-in-out]"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(56, 189, 248, 0.5))",
                }}
              />

              {/* Tag Style untuk Animasi Custom Linear Float */}
              <style>{`
                @keyframes smoothFloat {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-4px); }
                }
              `}</style>
            </div>

            <h2 className="text-2xl font-normal text-white/90 leading-snug mb-2">
              Mau dibantu ngerjain
              <br />
              <span className="text-blue-400">PR apa?</span>
            </h2>
            <p className="text-white/50 text-sm font-light leading-relaxed max-w-xs">
              Ketik soalmu atau upload foto PR · Aku akan ajarin step-by-step 😊
            </p>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* AI avatar */}
            {msg.role === "model" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}

            <div
              className={`max-w-[82%] ${
                msg.role === "user"
                  ? "bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 rounded-2xl rounded-tr-sm px-4 py-3"
                  : "text-white/85"
              }`}
            >
              {/* Image preview */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Foto soal"
                  className="rounded-xl mb-2 max-w-full max-h-52 object-contain bg-white/5"
                />
              )}

              {msg.isLoading ? (
                <LoadingDots />
              ) : msg.role === "model" ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:text-white/90 prose-strong:text-white/90 prose-code:text-blue-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Image preview ── */}
      {image && (
        <div className="relative z-10 px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={image}
              alt="Preview"
              className="h-16 rounded-xl border border-white/10 object-contain bg-white/5"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── Input area (Gemini style) ── */}
      <div className="relative z-10 px-4 pb-6 pt-2">
        <div
          className="flex items-end gap-3 rounded-2xl border border-white/10 px-4 py-3 transition-all duration-300 focus-within:border-blue-500/40 focus-within:shadow-lg focus-within:shadow-blue-500/10"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya PR"
            rows={1}
            className="flex-1 bg-transparent text-white/90 placeholder-white/25 text-sm outline-none resize-none leading-relaxed py-0.5 font-light"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />

          {/* Tombol kamera */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
            title="Upload foto soal"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Tombol kirim */}
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !image)}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() || image
                ? "bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/30 scale-100"
                : "bg-white/8 scale-95"
            } disabled:opacity-50`}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <p className="text-center text-white/15 text-[10px] mt-2.5 font-light tracking-wide">
          Enter kirim · Shift+Enter baris baru · Foto max 2.5MB
        </p>
      </div>

      {/* ── Exit Confirmation Dialog ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExitConfirm(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white/90 font-semibold text-center text-base mb-2">
              Tinggalkan percakapan?
            </h3>
            <p className="text-white/35 text-xs text-center leading-relaxed mb-6">
              Riwayat chat tidak tersimpan dan akan hilang saat kamu
              meninggalkan halaman ini.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #1a6cf6 0%, #0ea5e9 100%)",
                  boxShadow: "0 4px 20px rgba(26,108,246,0.3)",
                }}
              >
                Ya, tinggalkan
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all active:scale-95"
              >
                Lanjut ngerjain PR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
