import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  ArrowLeft,
  Trash2,
  Camera,
  Send,
  X,
  Sparkles,
  Plus,
  Brain,
  Paperclip,
  FileText,
  Copy,
  Check,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { trackEvent } from "../../lib/analytics";
import { toast } from "react-hot-toast";

import LogoAISaka from "../../../assets/LogoAISaka.svg";

// ─── Types ───────────────────────────────────────────────────────────────────
type Subject = "Matematika" | "Bahasa Inggris";
type MessageRole = "user" | "model";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  image?: string;
  document?: {
    name: string;
  };
  isLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Deteksi iOS
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches;

// ─── Custom Pre (Code block) Component with Copy Button ───────────────────
const MarkdownPre = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Kode disalin ke clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin kode:", err);
    }
  };

  return (
    <div className="relative group/code my-3">
      <pre
        ref={preRef}
        className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto text-xs font-mono text-blue-200"
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white/50 hover:text-white/90 hover:bg-black/80 transition-all opacity-0 group-hover/code:opacity-100 flex items-center gap-1 text-[10px] font-semibold cursor-pointer z-10"
        title="Salin kode"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? "Tersalin" : "Salin"}</span>
      </button>
    </div>
  );
};

// ─── Custom Table Component with Copy and Download CSV Buttons ─────────────
const MarkdownTable = ({ children, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState(false);

  const getTableData = (): string[][] => {
    const rows: string[][] = [];
    if (!tableRef.current) return rows;
    
    const trs = tableRef.current.querySelectorAll("tr");
    trs.forEach((tr) => {
      const row: string[] = [];
      const cells = tr.querySelectorAll("th, td");
      cells.forEach((cell) => {
        row.push(cell.textContent?.trim() || "");
      });
      if (row.length > 0) rows.push(row);
    });
    return rows;
  };

  const handleCopyTable = async () => {
    const data = getTableData();
    const text = data.map((row) => row.join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Tabel disalin! (Siap dipaste langsung ke Excel/Sheets) 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin tabel:", err);
    }
  };

  const handleDownloadCSV = () => {
    const data = getTableData();
    if (data.length === 0) return;
    const csvContent = data
      .map((row) =>
        row
          .map((val) => {
            const escaped = val.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tanya-pr-tabel.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Tabel diunduh sebagai berkas CSV! 📊");
  };

  return (
    <div className="relative group/table my-4 overflow-hidden rounded-2xl border border-white/10 bg-white/2">
      <div className="flex items-center justify-end gap-1.5 p-2 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={handleCopyTable}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-white/50 hover:text-white/90 hover:bg-white/10 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
          title="Salin isi tabel (bisa dipaste ke Excel)"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Tersalin" : "Salin Tabel"}</span>
        </button>
        <button
          onClick={handleDownloadCSV}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-white/50 hover:text-white/90 hover:bg-white/10 transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
          title="Download berkas CSV (Excel)"
        >
          <Download className="w-3 h-3 text-blue-400" />
          <span>CSV</span>
        </button>
      </div>
      
      <div className="overflow-x-auto w-full max-w-full">
        <table ref={tableRef} className="w-full border-collapse text-[11px]" {...props}>
          {children}
        </table>
      </div>
    </div>
  );
};

// ─── Custom Blockquote Component with Icon-Only Copy Button ───────────────────
const MarkdownBlockquote = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  const handleCopy = async () => {
    if (!quoteRef.current) return;
    const text = quoteRef.current.innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Disalin ke clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

  return (
    <div className="relative group/quote my-4">
      <blockquote
        ref={quoteRef}
        className="border-l-4 border-blue-500 bg-white/5 backdrop-blur-sm rounded-r-2xl py-3 px-4 text-white/85 text-xs italic leading-relaxed"
        {...props}
      >
        {children}
      </blockquote>
      {/* Tombol Salin Ikon Saja di Pojok Kanan Atas */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 border border-white/5 text-white/40 hover:text-white/80 hover:bg-black/60 transition-all md:opacity-0 md:group-hover/quote:opacity-100 opacity-80 flex items-center justify-center cursor-pointer z-10"
        title="Salin isi"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};

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
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [subject, setSubject] = useState<Subject>("Matematika");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    data: string;
    mimeType: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingSubject, setPendingSubject] = useState<Subject | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // State untuk PWA Installer Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (isIOS() && (navigator as any).standalone === true);
  const [showIOSBanner, setShowIOSBanner] = useState(
    isIOS() && !isInStandaloneMode(),
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
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

  // Efek klik global untuk menyalin rumus matematika LaTeX
  useEffect(() => {
    const handleFormulaClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Deteksi elemen rumus block (Katex Display)
      const katexDisplay = target.closest(".katex-display");
      if (katexDisplay) {
        const annotation = katexDisplay.querySelector("annotation");
        const latexText = annotation ? annotation.textContent : katexDisplay.textContent;
        if (latexText) {
          try {
            await navigator.clipboard.writeText(latexText);
            toast.success("Rumus matematika disalin! 📋");
          } catch (err) {
            console.error("Gagal menyalin rumus:", err);
          }
        }
      }
    };

    document.addEventListener("click", handleFormulaClick);
    return () => document.removeEventListener("click", handleFormulaClick);
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
    if (messages.length > 0) {
      setPendingSubject(s);
      return;
    }
    switchSubject(s);
  };

  const switchSubject = (s: Subject) => {
    setSubject(s);
    setMessages([]);
    setHasInteracted(false);
    setImage(null);
    setDocumentFile(null);
    setInput("");
    setPendingSubject(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Maksimal file dinaikkan menjadi 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran foto maksimal 10MB ya!");
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Maksimal file dinaikkan menjadi 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran dokumen maksimal 10MB ya!");
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedExt = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!isAllowedType && !isAllowedExt) {
      alert("Format berkas harus PDF, DOC, atau DOCX");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentFile({
        name: file.name,
        data: reader.result as string,
        mimeType:
          file.type ||
          (file.name.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !image && !documentFile) return;
    if (loading) return;

    setHasInteracted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      image: image || undefined,
      document: documentFile ? { name: documentFile.name } : undefined,
    };

    const loadingMessage: Message = {
      id: "loading",
      role: "model",
      content: "",
      isLoading: true,
    };

    const capturedImage = image;
    const capturedDocument = documentFile;

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setImage(null);
    setDocumentFile(null);
    setLoading(true);

    trackEvent("ai_saka_send", "ai_saka", subject);

    try {
      const historyMessages = [...messages, userMessage]
        .filter((m) => m.id !== "loading" && !m.isLoading)
        .map((m) => ({
          role: m.role,
          content:
            m.content ||
            (m.image ? "Ini foto soal saya" : `Ini lampiran dokumen: ${m.document?.name || "soal saya"}`),
        }));

      const body: Record<string, any> = { messages: historyMessages, subject };
      if (capturedImage) body.image = capturedImage;
      if (capturedDocument) body.document = capturedDocument;

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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (!file) continue;

        if (file.size > 10 * 1024 * 1024) {
          alert("Ukuran foto maksimal 10MB ya!");
          continue;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          toast.success("Gambar berhasil ditempel! 📸");
        };
        reader.readAsDataURL(file);
        
        e.preventDefault();
        break;
      }
    }
  };

  const handleClear = () => {
    setMessages([]);
    setHasInteracted(false);
    setImage(null);
    setDocumentFile(null);
    setInput("");
  };

  const confirmClearChat = () => {
    handleClear();
    setShowClearConfirm(false);
  };

  const showLogicTestButton =
    messages.length === 0 && input.trim() === "" && !image && !documentFile;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#06080c]"
      style={{
        background:
          "radial-gradient(circle at center, #0e1420 0%, #06080c 100%)",
      }}
    >
      {/* Ambient background glow khusus di desktop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] bg-gradient-to-b from-blue-500/20 to-indigo-500/0 hidden md:block" />

      {/* Container Utama (Frame Handphone di Desktop, Full-Screen di Mobile) */}
      <div
        className="relative w-full h-full md:max-w-[480px] md:h-[92vh] md:rounded-[32px] md:border md:border-white/10 md:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300"
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
                setShowClearConfirm(true);
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

        {/* ── PWA Update Notification Banner ── */}
        {needRefresh && (
          <div className="relative z-20 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-400/20 backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-white/90 text-xs font-black">Versi Baru Tersedia! 🚀</p>
                <p className="text-white/40 text-[10px] font-medium leading-tight mt-0.5">
                  Kuis logika & Saka AI terbaru siap dipasang.
                </p>
              </div>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3.5 py-1.5 bg-white text-blue-600 rounded-xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Perbarui
            </button>
          </div>
        )}

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
          className={`relative z-10 flex-1 px-4 py-2 space-y-6 ${
            hasInteracted
              ? "overflow-y-auto"
              : "overflow-hidden flex flex-col justify-center items-center"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {/* Greeting — terkunci tanpa scroll ketika belum ada interaksi */}
          {!hasInteracted && (
            <div className="flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-700 select-none">
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
          {hasInteracted &&
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
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
                  {/* Image preview in chat */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Foto soal"
                      className="rounded-xl mb-2 max-w-full max-h-52 object-contain bg-white/5"
                    />
                  )}

                  {/* Document badge in chat */}
                  {msg.document && (
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-2 max-w-full">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-white/80 font-medium truncate flex-1">
                        {msg.document.name}
                      </span>
                    </div>
                  )}

                  {msg.isLoading ? (
                    <LoadingDots />
                  ) : msg.role === "model" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:text-white/90 prose-strong:text-white/90 prose-code:text-blue-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          pre: MarkdownPre,
                          table: MarkdownTable,
                          blockquote: MarkdownBlockquote,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Image preview (Sebelum dikirim) ── */}
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
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ── Document preview (Sebelum dikirim) ── */}
        {documentFile && (
          <div className="relative z-10 px-4 pb-2">
            <div className="relative inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/85 font-medium max-w-[180px] truncate">
                {documentFile.name}
              </span>
              <button
                onClick={() => setDocumentFile(null)}
                className="w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow-lg transition-colors ml-1"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ── Input area (Sleek design with vertical centering) ── */}
        <div className="relative z-10 px-4 pb-6 pt-2">
          <div
            className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 transition-all duration-300 focus-within:border-blue-500/40 focus-within:shadow-lg focus-within:shadow-blue-500/10"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Input Textarea - diselaraskan ke vertikal tengah */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Tanya PR"
              rows={1}
              className="flex-1 bg-transparent text-white/90 placeholder-white/25 text-sm outline-none resize-none leading-normal py-1 font-light align-middle"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />

            {/* Tombol Kamera (Langsung buka kamera belakang di mobile) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
              title="Ambil foto soal"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Tombol Dokumen (PDF/Word) */}
            <button
              onClick={() => documentInputRef.current?.click()}
              className="flex-shrink-0 p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
              title="Unggah dokumen (PDF/Word)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleDocumentChange}
              className="hidden"
            />

            {/* Tombol kirim */}
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !image && !documentFile)}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                input.trim() || image || documentFile
                  ? "bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/30 scale-100 cursor-pointer"
                  : "bg-white/8 scale-95 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-center text-white/15 text-[10px] mt-2.5 font-light tracking-wide select-none">
            Enter kirim · Shift+Enter baris baru · Foto/File max 10MB
          </p>
        </div>

        {/* ── Exit Confirmation Dialog (Absolute inside frame) ── */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center px-6">
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
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer"
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
                  className="w-full py-3 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                >
                  Lanjut ngerjain PR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Subject Change Confirmation Dialog (Absolute inside frame) ── */}
        {pendingSubject && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPendingSubject(null)}
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
                Ganti mata pelajaran?
              </h3>
              <p className="text-white/35 text-xs text-center leading-relaxed mb-6">
                Riwayat obrolan {subject} kamu akan terhapus dan hilang ketika kamu berpindah ke {pendingSubject}.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => switchSubject(pendingSubject)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a6cf6 0%, #0ea5e9 100%)",
                    boxShadow: "0 4px 20px rgba(26,108,246,0.3)",
                  }}
                >
                  Ya, ganti mapel
                </button>
                <button
                  onClick={() => setPendingSubject(null)}
                  className="w-full py-3 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Clear Chat Confirmation Dialog (Absolute inside frame) ── */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <div
              className="relative w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              style={{
                background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-white/90 font-semibold text-center text-base mb-2">
                Hapus semua percakapan?
              </h3>
              <p className="text-white/35 text-xs text-center leading-relaxed mb-6">
                Seluruh riwayat chat kamu saat ini akan dihapus secara permanen dan tidak dapat dikembalikan lagi.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={confirmClearChat}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/20"
                >
                  Ya, hapus chat
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-3 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Floating "Tes Logika" Button (Absolute inside frame) ── */}
        {showLogicTestButton && (
          <button
            onClick={() => {
              trackEvent("ai_saka_go_to_logic_test", "ai_saka", "click");
              navigate("/tes-logika?from=ai");
            }}
            className="absolute bottom-[135px] right-4 z-30 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-[0.97] transition-all duration-200 cursor-pointer border border-blue-400/20"
          >
            <Brain className="w-4 h-4 text-blue-200" />
            <span>Tes Logika</span>
          </button>
        )}
      </div>
    </div>
  );
}
