import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Camera,
  Loader2,
  BookOpen,
  Trash2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { trackEvent } from "../../../lib/analytics";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// ─── Types ───────────────────────────────────────────────────────────────────
type Subject = "Matematika" | "Bahasa Inggris";
type MessageRole = "user" | "model";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  image?: string; // base64 preview untuk ditampilkan
  isLoading?: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SUBJECTS: Subject[] = ["Matematika", "Bahasa Inggris"];

const SUBJECT_COLOR: Record<Subject, string> = {
  Matematika: "bg-blue-500",
  "Bahasa Inggris": "bg-emerald-500",
};

const SUBJECT_PLACEHOLDER: Record<Subject, string> = {
  Matematika: "Contoh: Berapa hasil dari 3x + 5 = 20?",
  "Bahasa Inggris": "Contoh: Apa perbedaan Simple Past dan Past Continuous?",
};

// ─── Komponen utama ──────────────────────────────────────────────────────────
const AISakaChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [subject, setSubject] = useState<Subject>("Matematika");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content:
        "Halo! Aku **AI Saka** 👋 Aku siap bantu kamu belajar **Matematika** dan **Bahasa Inggris**.\n\nTulis soal kamu di bawah, atau upload foto soal pakai tombol 📷. Aku akan ajarin cara pengerjaannya step-by-step! 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Reset chat saat ganti subject
  const handleSubjectChange = (s: Subject) => {
    if (s === subject) return;
    setSubject(s);
    setMessages([
      {
        id: "welcome-" + s,
        role: "model",
        content: `Oke, sekarang kita belajar **${s}**! 📚\nKirim soalmu ya, aku siap bantu! 😊`,
      },
    ]);
    setImage(null);
    setInput("");
  };

  // Handle upload foto
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
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input agar file yang sama bisa diupload lagi
    e.target.value = "";
  };

  // Kirim pesan
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !image) return;
    if (loading) return;

    // Tambah pesan user ke UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed || (image ? "📷 [Foto soal]" : ""),
      image: image || undefined,
    };

    const loadingMessage: Message = {
      id: "loading",
      role: "model",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setImage(null);
    setLoading(true);

    // Track event GA
    trackEvent("ai_saka_send", "ai_saka", subject);

    try {
      // Bangun history untuk dikirim ke backend
      // (exclude pesan welcome & loading)
      const historyMessages = [...messages, userMessage]
        .filter((m) => m.id !== "loading" && !m.isLoading)
        .map((m) => ({
          role: m.role,
          content:
            m.content === "📷 [Foto soal]" ? "Ini foto soal saya" : m.content,
        }));

      const body: Record<string, any> = {
        messages: historyMessages,
        subject,
      };
      if (image) body.image = image;

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendapat jawaban");
      }

      // Ganti loading message dengan jawaban AI
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
                  err.message ||
                  "Waduh, ada gangguan nih 😅 Coba kirim lagi ya!",
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

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: `Chat direset! Yuk mulai lagi belajar **${subject}** 😊`,
      },
    ]);
    setImage(null);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">AI Saka</p>
            <p className="text-[10px] text-blue-100 font-medium">
              Asisten Belajar Pintar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            title="Hapus chat"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Subject Selector ── */}
      <div className="flex gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => handleSubjectChange(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              subject === s
                ? `${SUBJECT_COLOR[s]} text-white shadow-sm`
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            {s}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hidden-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "model" && (
              <div className="w-7 h-7 rounded-full bg-[#0066FF] flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-[#0066FF] text-white rounded-tr-sm"
                  : "bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100"
              }`}
            >
              {/* Preview gambar jika ada */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Foto soal"
                  className="rounded-xl mb-2 max-w-full max-h-48 object-contain"
                />
              )}

              {/* Loading dots */}
              {msg.isLoading ? (
                <div className="flex gap-1 items-center py-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              ) : msg.role === "model" ? (
                // Render markdown untuk pesan AI
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Preview gambar yang akan dikirim ── */}
      {image && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="relative inline-block">
            <img
              src={image}
              alt="Preview soal"
              className="h-20 rounded-xl border border-slate-200 object-contain bg-slate-50"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            📷 Foto soal siap dikirim
          </p>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 focus-within:border-[#0066FF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Tombol kamera */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload foto soal"
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-slate-200 transition-colors mb-0.5"
          >
            <Camera className="w-4 h-4 text-slate-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={SUBJECT_PLACEHOLDER[subject]}
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none resize-none leading-relaxed py-1"
          />

          {/* Tombol kirim */}
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !image)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0066FF] disabled:bg-slate-200 flex items-center justify-center transition-all hover:bg-[#0052CC] active:scale-95 mb-0.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-300 text-center mt-2 font-medium">
          Enter untuk kirim · Shift+Enter untuk baris baru · Foto max 2.5MB
        </p>
      </div>
    </div>
  );
};

export default AISakaChat;
