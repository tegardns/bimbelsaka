import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Download,
  Flame,
  Home,
  RotateCcw,
  Share2,
  Target,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

import shareTemplate from "../../imports/Frame_37.png";

type Stage = "landing" | "profile" | "intro" | "quiz" | "calculating" | "results";
type LevelId = "SD_1_2" | "SD_3_4" | "SD_5_6" | "SMP_7_8" | "SMP_8_9";
type QuestionType = "pattern" | "number" | "logic" | "spatial";

type Level = {
  id: LevelId;
  title: string;
  name: string;
  emoji: string;
  description: string;
  vibe: string;
};

type Question = {
  id: number;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  correctAnswer: number;
};

type AnswerRecord = {
  questionId: number;
  question: string;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  type: QuestionType;
  timeSpent: number;
};

type QuizResult = {
  playerName: string;
  level: Level;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  avgTime: number;
  title: string;
  caption: string;
  message: string;
  aiAnalysis: string;
  breakdown: Record<QuestionType, { correct: number; total: number }>;
  answers: AnswerRecord[];
};

type PhotoState = {
  image: HTMLImageElement | null;
  scale: number;
  x: number;
  y: number;
};

const QUESTION_API_PATH = "/api/logic-test/questions";
const ANALYSIS_API_PATH = "/api/logic-test/analyze";
const USE_API_QUESTIONS =
  import.meta.env.VITE_LOGIC_TEST_API_ENABLED === "true";
const USE_GEMINI_ANALYSIS =
  import.meta.env.VITE_LOGIC_TEST_AI_ENABLED === "true";

const LEVELS: Record<LevelId, Level> = {
  SD_1_2: {
    id: "SD_1_2",
    name: "Kelas 1-2 SD",
    title: "Logic Scout",
    emoji: "🧭",
    description: "Starter",
    vibe: "Penjelajah muda yang baru mulai membaca peta logika sederhana.",
  },
  SD_3_4: {
    id: "SD_3_4",
    name: "Kelas 3-4 SD",
    title: "Code Breaker",
    emoji: "🔍",
    description: "Pemecah Kode",
    vibe: "Detektif cilik yang mulai memecahkan teka-teki, sandi, dan pola tersembunyi.",
  },
  SD_5_6: {
    id: "SD_5_6",
    name: "Kelas 5-6 SD",
    title: "Mind Master",
    emoji: "🧠",
    description: "Penguasa Pikiran",
    vibe: "Pemikir taktis yang siap menghadapi tantangan transisi ke SMP.",
  },
  SMP_7_8: {
    id: "SMP_7_8",
    name: "Kelas 7-8 SMP",
    title: "Logic Knight",
    emoji: "⚔️",
    description: "Ksatria Logika",
    vibe: "Ksatria logika yang bertarung dengan pola abstrak dan penalaran deduktif.",
  },
  SMP_8_9: {
    id: "SMP_8_9",
    name: "Kelas 8-9 SMP",
    title: "Grandmaster",
    emoji: "👑",
    description: "Penguasa Tertinggi",
    vibe: "Penguasa taktik tertinggi di Arena Otak, siap untuk tantangan akademis lebih tinggi.",
  },
};

function getHumanistMessage(playerName: string, score: number, correctAnswers: number, totalQuestions: number) {
  if (score >= 90) {
    return `🎉 Luar biasa hebat, ${playerName}! Kamu berhasil menjawab ${correctAnswers} dari ${totalQuestions} soal dengan sempurna. Otak cemerlangmu bersinar sangat terang hari ini! 🌟`;
  }
  if (score >= 75) {
    return `🚀 Keren sekali, ${playerName}! Kamu berhasil menjawab ${correctAnswers} dari ${totalQuestions} soal dengan benar. Cara berpikirmu sudah sangat tajam, yuk pertahankan terus! 🏆`;
  }
  if (score >= 50) {
    return `✨ Hebat, ${playerName}! Kamu menjawab ${correctAnswers} dari ${totalQuestions} soal dengan benar. Pemahaman logikamu sudah sangat baik, ayo latih sedikit lagi untuk raih skor sempurna! 💪`;
  }
  return `🌱 Langkah awal yang bagus, ${playerName}! Kamu menjawab ${correctAnswers} dari ${totalQuestions} soal dengan baik. Setiap kesalahan adalah cara otak kita belajar menjadi lebih pintar. Mari coba lagi dan taklukkan level ini! 🎯`;
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split("**");
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-extrabold text-indigo-950">
          {part}
        </strong>
      );
    }
    return part;
  });
}

export function TestLogikaPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("landing");
  const [profileStep, setProfileStep] = useState(1);
  const [playerName, setPlayerName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelId>("SD_1_2");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [typedIntro, setTypedIntro] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcStatus, setCalcStatus] = useState("");

  const level = LEVELS[selectedLevel];
  const currentQ = questions[currentQuestion];
  const progress = questions.length
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0;
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  useEffect(() => {
    if (stage !== "intro") return;

    const text = `Halo ${playerName || "Pejuang"}! Kamu akan menghadapi 20 misi logika sebagai ${level.title} ${level.emoji}. Setiap misi punya waktu 30 detik. Baca soal dengan tenang, pilih jawaban terbaik, dan tunjukkan kemampuanmu!`;
    setTypedIntro("");

    let index = 0;
    const typingTimer = window.setInterval(() => {
      setTypedIntro(text.slice(0, index));
      index += 1;

      if (index > text.length) {
        window.clearInterval(typingTimer);
        window.setTimeout(() => {
          resetQuizOnly();
          setStage("quiz");
        }, 900);
      }
    }, 26);

    return () => window.clearInterval(typingTimer);
  }, [stage, playerName, level]);

  useEffect(() => {
    if (stage !== "quiz" || showFeedback || !currentQ) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          handleAnswer(null);
          return 30;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, currentQuestion, showFeedback, currentQ]);

  async function loadQuestionsForSelectedLevel() {
    setQuestionLoading(true);
    setQuestionError("");

    try {
      const loaded = await fetchQuestions(selectedLevel);
      setQuestions(loaded);
      setStage("intro");
    } catch (error) {
      setQuestionError(
        error instanceof Error ? error.message : "Gagal memuat soal.",
      );
    } finally {
      setQuestionLoading(false);
    }
  }

  function resetQuizOnly() {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(30);
    setResult(null);
    setAnalysisLoading(false);
  }

  function handleStartIntro() {
    if (!playerName.trim()) return;
    loadQuestionsForSelectedLevel();
  }

  function handleAnswer(index: number | null) {
    if (showFeedback || !currentQ) return;

    const timeSpent = 30 - timeLeft;
    const correct = index === currentQ.correctAnswer;
    const answerRecord: AnswerRecord = {
      questionId: currentQ.id,
      question: currentQ.question,
      selectedAnswer: index,
      correctAnswer: currentQ.correctAnswer,
      isCorrect: correct,
      type: currentQ.type,
      timeSpent,
    };

    const nextAnswers = [...answers, answerRecord];

    setAnswers(nextAnswers);
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak((previous) => Math.max(previous, nextStreak));
      if (nextStreak >= 3) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 } });
      }
    } else {
      setStreak(0);
    }

    window.setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((previous) => previous + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(30);
      } else {
        finishQuiz(nextAnswers);
      }
    }, 1200);
  }

  async function finishQuiz(finalAnswers: AnswerRecord[]) {
    setStage("calculating");
    setCalcProgress(0);
    setCalcStatus("🧭 Memetakan skor dan jawaban...");

    const correctAnswers = finalAnswers.filter(
      (answer) => answer.isCorrect,
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const avgTime =
      finalAnswers.length > 0
        ? finalAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0) /
        finalAnswers.length
        : 0;

    const breakdown: QuizResult["breakdown"] = {
      pattern: { correct: 0, total: 0 },
      number: { correct: 0, total: 0 },
      logic: { correct: 0, total: 0 },
      spatial: { correct: 0, total: 0 },
    };

    finalAnswers.forEach((answer) => {
      breakdown[answer.type].total += 1;
      if (answer.isCorrect) breakdown[answer.type].correct += 1;
    });

    const baseResult: QuizResult = {
      playerName: playerName.trim(),
      level,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      streak: maxStreak,
      avgTime,
      title: getTitleByScore(score),
      caption: getCaptionByScore(score),
      message: `Kamu berhasil menjawab ${correctAnswers} dari ${questions.length} soal dengan benar.`,
      aiAnalysis: "",
      breakdown,
      answers: finalAnswers,
    };

    // Panggil API analisis AI di background
    let aiAnalysisResult = "";
    const apiPromise = fetchAiAnalysis(baseResult)
      .then((res) => {
        aiAnalysisResult = res;
      })
      .catch(() => {
        aiAnalysisResult = "Maaf, AI Saka sedang beristirahat sebentar. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi untuk mendapatkan analisis kognitif detail dari Gemini AI! 🌟";
      });

    // Simulasi loading progress bar yang organik dan menarik
    let currentPercent = 0;
    const interval = window.setInterval(() => {
      currentPercent += Math.floor(Math.random() * 8) + 4; // naik secara random (organik)
      if (currentPercent > 95) {
        currentPercent = 95; // tahan di 95% jika API belum selesai
      }

      setCalcProgress(currentPercent);

      // Ubah pesan status berdasarkan persentase
      if (currentPercent < 25) {
        setCalcStatus("🧭 Memetakan skor dan jawaban...");
      } else if (currentPercent < 50) {
        setCalcStatus("🧠 Menganalisis kecerdasan logika & spasial...");
      } else if (currentPercent < 75) {
        setCalcStatus(`⚡ Merumuskan kekuatan kognitif ${playerName.trim()}...`);
      } else {
        setCalcStatus("🤖 Menyusun saran belajar dari AI Saka...");
      }
    }, 120);

    // Tunggu sampai API selesai DAN progress bar siap
    await apiPromise;
    window.clearInterval(interval);

    // Kebut progress ke 100% untuk efek kepuasan visual
    setCalcProgress(100);
    setCalcStatus("✨ Analisis Siap!");

    window.setTimeout(() => {
      setResult({ ...baseResult, aiAnalysis: aiAnalysisResult });
      setStage("results");
      setAnalysisLoading(false);
      window.setTimeout(
        () => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }),
        300,
      );
    }, 500);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900">
      {stage === "landing" && (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
          {/* Soft subtle background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-100 opacity-40 blur-[100px]" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-pink-100 opacity-40 blur-[100px]" />
          </div>

          {/* Minimal floating accents — very faded */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="landing-float-1 absolute left-[10%] top-[15%] text-2xl opacity-[0.15]">✦</span>
            <span className="landing-float-2 absolute right-[12%] top-[10%] text-xl opacity-[0.12]">✦</span>
            <span className="landing-float-3 absolute left-[18%] bottom-[20%] text-lg opacity-[0.12]">✦</span>
            <span className="landing-float-1 absolute right-[15%] bottom-[15%] text-2xl opacity-[0.15]">✦</span>
          </div>

          <style>{`
            @keyframes landingFloat1 {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-14px); }
            }
            @keyframes landingFloat2 {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes landingFloat3 {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-12px) scale(1.1); }
            }
            @keyframes landingBounce {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-10px) scale(1.05); }
            }
            @keyframes landingShine {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes pageEnter {
              0% { opacity: 0; transform: translateY(24px) scale(0.97); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeSlideUp {
              0% { opacity: 0; transform: translateY(16px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .page-enter { animation: pageEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
            .stagger-1 { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
            .stagger-2 { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
            .stagger-3 { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
            .stagger-4 { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both; }
            .stagger-5 { animation: fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both; }
            .landing-float-1 { animation: landingFloat1 5s ease-in-out infinite; }
            .landing-float-2 { animation: landingFloat2 6s ease-in-out infinite 0.5s; }
            .landing-float-3 { animation: landingFloat3 4.5s ease-in-out infinite 1s; }
            .landing-bounce { animation: landingBounce 3s ease-in-out infinite; }
          `}</style>

          <button
            onClick={() => navigate("/")}
            className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition active:scale-95"
            aria-label="Kembali ke beranda"
            title="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative z-10 w-full max-w-sm space-y-7 text-center">
            {/* Icon */}
            <div className="stagger-1 landing-bounce mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200/50">
              <span className="text-5xl">🚀</span>
            </div>

            {/* Title & subtitle */}
            <div className="stagger-2 space-y-3">
              <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                Ayo Main{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Teka-Teki!
                </span>
              </h1>
              <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-slate-400">
                Pecahkan 20 soal seru, kumpulkan skor tinggi, dan raih gelar juara logika!
              </p>
            </div>

            {/* Flat inline stats — no containers */}
            <div className="stagger-3 flex items-center justify-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="text-lg">🎯</span> 20 Soal
              </span>
              <span className="h-4 w-px bg-slate-200" />
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="text-lg">⏱️</span> 30 Detik
              </span>
              <span className="h-4 w-px bg-slate-200" />
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="text-lg">🔥</span> Streak
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setStage("profile")}
              className="stagger-4 relative h-14 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-base font-black text-white shadow-lg shadow-indigo-200/40 transition active:scale-[0.97]"
            >
              <span className="relative z-10">Mulai Petualangan 🚀</span>
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "landingShine 3s linear infinite",
                }}
              />
            </button>

            <p className="stagger-5 text-xs text-slate-300">
              Gratis • Tanpa login • Langsung main
            </p>
          </div>
        </section>
      )}
      {stage === "profile" && (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
          {/* Soft background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-100 opacity-30 blur-[100px]" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-100 opacity-30 blur-[100px]" />
          </div>

          <button
            onClick={() =>
              profileStep === 1 ? setStage("landing") : setProfileStep(1)
            }
            className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition active:scale-95"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="page-enter relative z-10 w-full max-w-sm space-y-8 text-center">
            {/* Step indicator */}
            <div className="flex justify-center gap-2">
              {[1, 2].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${profileStep === step
                      ? "w-8 bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "w-2 bg-slate-200"
                    }`}
                />
              ))}
            </div>

            {profileStep === 1 ? (
              <div key="step-name" className="page-enter space-y-6">
                <div className="stagger-1 space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Siapa nama kamu? ✌️
                  </h2>
                  <p className="text-sm text-slate-400">
                    Tulis nama panggilanmu untuk memulai
                  </p>
                </div>

                <input
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" &&
                    playerName.trim() &&
                    setProfileStep(2)
                  }
                  autoFocus
                  placeholder="Ketik namamu di sini..."
                  className="stagger-2 h-14 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-5 text-center text-lg font-semibold text-slate-900 outline-none backdrop-blur-sm placeholder:text-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50"
                />

                <button
                  onClick={() => playerName.trim() && setProfileStep(2)}
                  disabled={!playerName.trim()}
                  className="stagger-3 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-black text-white shadow-lg shadow-indigo-200/40 transition active:scale-[0.97] disabled:opacity-30"
                >
                  Lanjut <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div key="step-level" className="page-enter space-y-5">
                <div className="stagger-1 space-y-1">
                  <h2 className="text-2xl font-black text-slate-900">
                    Pilih levelmu, {playerName}! 🎮
                  </h2>
                  <p className="text-sm text-slate-400">
                    Sesuaikan dengan kelasmu sekarang
                  </p>
                </div>

                <div className="stagger-2 grid gap-2">
                  {Object.values(LEVELS).map((item) => {
                    const active = selectedLevel === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedLevel(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition active:scale-[0.98] ${active
                            ? "bg-indigo-50 ring-2 ring-indigo-400/40"
                            : "bg-white/60 hover:bg-white/90"
                          }`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-slate-900">
                            {item.title}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {item.name}
                          </span>
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${active
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-slate-200 bg-transparent"
                            }`}
                        >
                          {active && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {questionError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {questionError}
                  </div>
                )}

                <button
                  onClick={handleStartIntro}
                  disabled={questionLoading}
                  className="stagger-3 h-13 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-black text-white shadow-lg shadow-indigo-200/40 transition active:scale-[0.97] disabled:opacity-60"
                >
                  {questionLoading ? "Memuat Soal..." : "Mulai Tes 🚀"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {stage === "intro" && (
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
          <LightBackground />
          <div className="page-enter relative z-10 w-full max-w-lg space-y-7 text-center">
            <div className="stagger-1 text-7xl drop-shadow-sm">{level.emoji}</div>
            <div className="stagger-2 min-h-[210px] rounded-3xl bg-white/95 p-6 text-left shadow-xl shadow-sky-100/60 sm:p-8">
              <p className="text-base font-semibold leading-relaxed text-slate-700 sm:text-lg">
                {typedIntro}
                <span className="ml-1 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-[#006EFF]" />
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Menyiapkan misi...
            </div>
          </div>
        </section>
      )}

      {stage === "quiz" && currentQ && (
        <section className="relative min-h-screen px-3 py-4 sm:px-4">
          <LightBackground subtle />
          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm"
                style={{
                  background: timeLeft <= 5 ? "#FEF2F2" : "#EFF6FF",
                  borderColor: timeLeft <= 5 ? "#FCA5A5" : "#BFDBFE",
                  color: timeLeft <= 5 ? "#DC2626" : "#006EFF",
                }}
              >
                <Zap className="h-4 w-4" />
                <span className="text-xl font-black tabular-nums">
                  {timeLeft}s
                </span>
              </div>
              <div className="min-w-0 flex-1 text-center">
                <p className="mb-1 text-xs font-semibold text-slate-400">
                  Misi {currentQuestion + 1} dari {questions.length}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#006EFF] to-[#00A884] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-2 text-orange-500 shadow-sm">
                <Flame className="h-4 w-4" />
                <span className="text-xl font-black">{streak}</span>
              </div>
            </div>

            {streak >= 3 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-black text-amber-700">
                🔥 Streak {streak}x! Fokusmu sedang tajam, {playerName}!
              </div>
            )}

            <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-sky-100/60 sm:p-7">
              <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                🎯 Misi {currentQuestion + 1}
              </div>
              <h2 className="mb-5 text-base font-bold leading-relaxed text-slate-950 sm:text-xl">
                {currentQ.question}
              </h2>
              <div className="grid gap-3">
                {currentQ.options.map((option, index) => {
                  const optionSelected = selectedAnswer === index;
                  const showCorrect =
                    showFeedback && index === currentQ.correctAnswer;
                  const showWrong =
                    showFeedback && optionSelected && !isCorrect;
                  const stateClass = showCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : showWrong
                      ? "border-red-300 bg-red-50 text-red-700"
                      : optionSelected
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60";

                  return (
                    <button
                      key={`${currentQ.id}-${option}`}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${stateClass}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                        {["A", "B", "C", "D"][index]}
                      </span>
                      <span className="flex-1 text-sm font-semibold sm:text-base">
                        {option}
                      </span>
                      {showCorrect && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-center text-sm font-black ${isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-600"
                    }`}
                >
                  {isCorrect
                    ? "Benar! Keren banget."
                    : selectedAnswer === null
                      ? "Waktu habis. Tetap lanjut!"
                      : "Hampir! Tetap semangat."}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="fixed bottom-4 left-4 z-20 flex h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-black text-slate-600 shadow-lg shadow-slate-200/80 transition active:scale-95"
          >
            Keluar
          </button>

          {showExitConfirm && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
                <h3 className="text-xl font-black text-slate-950">
                  Keluar dari tes?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Progress jawaban saat ini akan berhenti dan kamu kembali ke
                  halaman awal tes.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      resetQuizOnly();
                      setShowExitConfirm(false);
                      setStage("landing");
                    }}
                    className="h-12 rounded-2xl bg-red-500 text-sm font-black text-white"
                  >
                    Keluar
                  </button>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="h-12 rounded-2xl bg-[#006EFF] text-sm font-black text-white"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {stage === "calculating" && (
        <section className="relative flex min-h-screen items-center justify-center px-4 py-8">
          <LightBackground />
          <div className="relative z-10 w-full max-w-sm space-y-8 text-center page-enter">
            {/* Pulsing Glowing AI Ring Loader */}
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center select-none">
              {/* Outer pulsing shadow circle */}
              <div className="absolute h-28 w-28 animate-ping rounded-full bg-indigo-100 opacity-75"></div>
              {/* Spinning gradient ring */}
              <div className="absolute h-24 w-24 rounded-full border-4 border-slate-100/40"></div>
              <div
                className="absolute h-24 w-24 rounded-full border-4 border-t-indigo-600 border-r-emerald-400 animate-spin"
                style={{ animationDuration: "1.2s" }}
              ></div>
              {/* Inner central icon */}
              <div className="absolute flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                <Brain className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Title & Progress details */}
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Menghitung Hasil Kuis
              </h2>
              <p className="mx-auto max-w-[280px] text-xs font-black text-indigo-500 uppercase tracking-widest animate-pulse h-4">
                {calcStatus}
              </p>
            </div>

            {/* Custom Premium Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/40 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>MEMUAT ANALISIS</span>
                <span className="tabular-nums font-black text-slate-700">{calcProgress}%</span>
              </div>
            </div>

            {/* Sub-text quote */}
            <p className="text-[11px] leading-relaxed text-slate-400 italic max-w-[260px] mx-auto select-none">
              "Otakmu seperti otot, semakin sering digunakan memecahkan tantangan, ia akan tumbuh semakin cerdas!"
            </p>
          </div>
        </section>
      )}

      {stage === "results" && result && (
        <section className="relative min-h-screen px-3 py-5 sm:px-4">
          <LightBackground subtle />
          <div className="relative z-10 mx-auto w-full max-w-4xl space-y-5 md:py-4">

            <div className="text-center py-6 sm:py-8 max-w-2xl mx-auto select-none">


              {/* Player Name */}
              <h1 className="text-4xl font-black tracking-tight text-slate-950 mb-1.5">
                {result.playerName}
              </h1>

              {/* Title Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 px-4 py-1.5 text-sm font-extrabold text-[#006EFF] mb-3 border border-blue-100/30">
                <Zap className="h-3.5 w-3.5 fill-[#006EFF] text-[#006EFF]" /> {result.title}
              </div>

              {/* Level & Caption Subtitle */}
              <p className="mb-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                {result.level.emoji} {result.level.name} • {result.caption}
              </p>

              {/* SVG Circular Progress Ring */}
              <div className="relative mx-auto mb-6 flex h-44 w-44 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    className="stroke-slate-100/80 fill-none"
                    strokeWidth="12"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    className="fill-none transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={452}
                    strokeDashoffset={452 - (452 * result.score) / 100}
                    stroke="url(#scoreGradient)"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#006EFF" />
                      <stop offset="50%" stopColor="#00A884" />
                      <stop offset="100%" stopColor="#E91E8C" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Score Label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tracking-tight text-slate-900">
                    {result.score}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                    Skor Kognitif
                  </span>
                </div>

                {/* Floating Shiny Trophy */}
                <div className="absolute -right-1 -top-1 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-200 border-2 border-white animate-bounce">
                  <Trophy className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
              </div>

              {/* Encouraging Humanist Message - Simple, Clean & Engaging (No Container) */}
              <p className="mx-auto max-w-lg text-sm font-bold leading-relaxed text-slate-600 mt-4 px-4">
                {getHumanistMessage(result.playerName, result.score, result.correctAnswers, result.totalQuestions)}
              </p>

              {/* Share Story Button */}
              <button
                onClick={() => {
                  document.getElementById("generate-card-story")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#006EFF] to-[#00A884] px-6 text-sm font-black text-white shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share Story
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-sky-100/60 sm:p-6">
                  <h2 className="mb-4 flex items-center gap-2 font-black text-slate-950">
                    <Target className="h-4 w-4 text-blue-500" /> Statistik
                  </h2>
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <Metric
                      label="Jawaban Benar"
                      value={`${result.correctAnswers}/${result.totalQuestions}`}
                      color="#00A884"
                    />
                    <Metric
                      label="Max Streak"
                      value={`🔥 ${result.streak}`}
                      color="#F59E0B"
                    />
                    <Metric
                      label="Rata-rata Waktu"
                      value={`${result.avgTime.toFixed(1)}s`}
                      color="#006EFF"
                    />
                    <Metric
                      label="Skor Total"
                      value={`${result.score}%`}
                      color="#E91E8C"
                    />
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.breakdown).map(([type, data]) => {
                      const percent = data.total
                        ? (data.correct / data.total) * 100
                        : 0;
                      const color =
                        percent >= 75
                          ? "#00A884"
                          : percent >= 50
                            ? "#F59E0B"
                            : "#EF4444";
                      return (
                        <div key={type}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-semibold text-slate-600">
                              {typeLabel(type as QuestionType)}
                            </span>
                            <span className="font-bold" style={{ color }}>
                              {data.correct}/{data.total}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percent}%`,
                                background: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modern AI Theme Analysis Card */}
                <div className="rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-blue-50/80 p-5 shadow-lg border border-indigo-100/50 sm:p-6">
                  <div className="flex items-center justify-between border-b border-indigo-100/40 pb-3 mb-4 select-none">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-100">
                        <Brain className="h-4.5 w-4.5 text-white animate-pulse" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                      </div>
                      <div>
                        <h2 className="font-extrabold text-indigo-900 tracking-tight text-base leading-none">
                          Analisis AI Saka
                        </h2>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1.5 block">
                          AI Kognitif Aktif
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100/30 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ready
                    </div>
                  </div>

                  <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                    {analysisLoading && !result.aiAnalysis ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3 select-none">
                        <div className="relative flex h-10 w-10 items-center justify-center">
                          <div className="absolute h-full w-full rounded-full border-4 border-indigo-100"></div>
                          <div className="absolute h-full w-full rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                        </div>
                        <p className="text-xs font-black text-indigo-500 animate-pulse uppercase tracking-wider">
                          Sedang merumuskan analisis kognitif...
                        </p>
                      </div>
                    ) : (
                      renderFormattedText(result.aiAnalysis)
                    )}
                  </div>
                </div>
              </div>

              <div id="generate-card-story" className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-sky-100/60 sm:p-6 scroll-mt-6">
                <h2 className="mb-4 flex items-center gap-2 font-black text-slate-950">
                  <Share2 className="h-5 w-5 text-[#006EFF]" /> Generate Card
                  Story
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  Tambahkan foto, geser posisinya, lalu download atau share
                  untuk IG Story/WA Story.
                </p>
                <ShareCardEditor result={result} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  resetQuizOnly();
                  setProfileStep(2);
                  setStage("profile");
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-600 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" /> Main Lagi
              </button>
              <button
                onClick={() => setStage("landing")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-600 shadow-sm"
              >
                <Home className="h-4 w-4" /> Beranda Tes
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function ShareCardEditor({ result }: { result: QuizResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<PhotoState>({
    image: null,
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const photoArea = useMemo(
    () => ({
      x: 118.44,
      y: 380.54,
      width: 843.12,
      height: 749.81,
    }),
    [],
  );

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;
    ctx.clearRect(0, 0, 1080, 1920);

    if (photo.image) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
      ctx.clip();

      const centerX = photoArea.x + photoArea.width / 2;
      const centerY = photoArea.y + photoArea.height / 2;
      const scaledWidth = photo.image.width * photo.scale;
      const scaledHeight = photo.image.height * photo.scale;

      ctx.drawImage(
        photo.image,
        centerX - scaledWidth / 2 + photo.x,
        centerY - scaledHeight / 2 + photo.y,
        scaledWidth,
        scaledHeight,
      );
      ctx.restore();
    }

    const template = new Image();
    await new Promise<void>((resolve) => {
      template.onload = () => resolve();
      template.onerror = () => resolve();
      template.src = shareTemplate;
    });
    ctx.drawImage(template, 0, 0, 1080, 1920);

    const drawTextWithShadow = (
      text: string,
      x: number,
      y: number,
      align: CanvasTextAlign = "center",
    ) => {
      ctx.textAlign = align;
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(text, x, y);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    ctx.font = "100px 'Caveat', cursive";
    ctx.fillStyle = "#FFFFFF";
    drawTextWithShadow(`${result.level.emoji} ${result.title}`, 540, 139.95);

    ctx.font = "bold 60px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    drawTextWithShadow(result.playerName, 540, 1021.91);

    ctx.font = "bold 120px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#00307A";
    drawTextWithShadow(result.score.toString(), 540, 1158.28);

    ctx.font = "bold 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#00307A";
    drawTextWithShadow(result.caption, 540, 1321.72);

    ctx.font = "bold 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#00307A";
    drawTextWithShadow(
      `${result.correctAnswers}/${result.totalQuestions}`,
      223.47,
      1457.7,
      "left",
    );
    drawTextWithShadow(`🔥 ${result.streak}`, 587.79, 1457.7, "left");
    drawTextWithShadow(
      `${result.avgTime.toFixed(1)} detik/soal`,
      223.47,
      1617.35,
      "left",
    );
    drawTextWithShadow(`${result.score}%`, 587.79, 1617.35, "left");
  }, [photo, photoArea, result]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        const scaleX = photoArea.width / image.width;
        const scaleY = photoArea.height / image.height;
        setPhoto({ image, scale: Math.max(scaleX, scaleY), x: 0, y: 0 });
      };
      image.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!photo.image) return;
    setIsDragging(true);
    setDragStart({
      x: event.nativeEvent.offsetX - photo.x,
      y: event.nativeEvent.offsetY - photo.y,
    });
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDragging || !photo.image) return;
    setPhoto((previous) => ({
      ...previous,
      x: event.nativeEvent.offsetX - dragStart.x,
      y: event.nativeEvent.offsetY - dragStart.y,
    }));
  }

  function getTouchDistance(touches: React.TouchList) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLCanvasElement>) {
    if (!photo.image) return;

    if (event.touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touch = event.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 1080;
      const y = ((touch.clientY - rect.top) / rect.height) * 1920;
      setIsDragging(true);
      setDragStart({ x: x - photo.x, y: y - photo.y });
    } else if (event.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(event.touches));
    }
  }

  function handleTouchMove(event: React.TouchEvent<HTMLCanvasElement>) {
    if (!photo.image) return;
    event.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (event.touches.length === 1 && isDragging) {
      const touch = event.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 1080;
      const y = ((touch.clientY - rect.top) / rect.height) * 1920;
      setPhoto((previous) => ({
        ...previous,
        x: x - dragStart.x,
        y: y - dragStart.y,
      }));
    } else if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches);
      if (lastTouchDistance > 0) {
        const scaleDelta = (distance - lastTouchDistance) * 0.01;
        setPhoto((previous) => ({
          ...previous,
          scale: clamp(previous.scale + scaleDelta, 0.5, 4),
        }));
      }
      setLastTouchDistance(distance);
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    if (!photo.image) return;
    event.preventDefault();
    setPhoto((previous) => ({
      ...previous,
      scale: clamp(previous.scale - event.deltaY * 0.001, 0.5, 4),
    }));
  }

  function downloadCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `saka-logic-test-${result.playerName}-${result.score}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function shareCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File(
        [blob],
        `saka-logic-test-${result.playerName}-${result.score}.png`,
        { type: "image/png" },
      );
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Hasil Tes Logika Bimbel Saka",
          text: `Aku dapat skor ${result.score}! Coba juga yuk!`,
        });
        return;
      }
      downloadCard();
      alert(
        "Perangkat ini belum mendukung share file langsung. Kartu sudah didownload, silakan upload ke IG Story/WA Story.",
      );
    }, "image/png");
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto w-full max-w-sm">
        <canvas
          ref={canvasRef}
          className="h-auto w-full touch-none rounded-2xl border-2 border-slate-100 bg-slate-100 shadow-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => {
            setIsDragging(false);
            setLastTouchDistance(0);
          }}
          onWheel={handleWheel}
        />
        {!photo.image && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-xl bg-slate-950/60 px-4 py-2 text-center text-sm font-semibold text-white">
              Tambahkan Foto Kerenmu
            </p>
          </div>
        )}
      </div>

      {photo.image && (
        <p className="text-center text-xs font-medium text-slate-500">
          Geser untuk mengatur posisi. Pinch atau scroll untuk zoom.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-black text-slate-700 shadow-sm"
      >
        <Upload className="h-4 w-4" />
        {photo.image ? "Ganti Foto" : "Tambahkan Foto Kamu"}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadCard}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm"
        >
          <Download className="h-4 w-4" /> Download
        </button>
        <button
          onClick={shareCard}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#006EFF] text-sm font-black text-white shadow-lg"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}

async function fetchQuestions(levelId: LevelId) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    const response = await fetch(
      `${apiBaseUrl}${QUESTION_API_PATH}?level=${levelId}`,
    );
    const result = await response.json();
    if (response.ok && result.success && result.data && result.data.length > 0) {
      return result.data as Question[];
    } else {
      console.warn("Gagal mengambil soal dari API backend, menggunakan fallback mock questions:", result?.message);
    }
  } catch (err) {
    console.error("Kesalahan koneksi ke API backend:", err);
  }

  await new Promise((resolve) => window.setTimeout(resolve, 250));
  return buildMockQuestions(levelId);
}

async function fetchAiAnalysis(result: QuizResult) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    const response = await fetch(`${apiBaseUrl}/api/logic-test/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: result.playerName,
        level: result.level.id,
        score: result.score,
        breakdown: result.breakdown,
        answers: result.answers,
      }),
    });
    const data = await response.json();
    if (response.ok && data.success && data.data && data.data.analysis) {
      return data.data.analysis as string;
    } else {
      throw new Error(data?.message || "Format respon API analisis tidak valid");
    }
  } catch (err) {
    console.error("Gagal terhubung ke API Analisis AI backend:", err);
    throw new Error("Gagal mengambil analisis langsung dari AI Saka.");
  }
}

function buildMockQuestions(levelId: LevelId): Question[] {
  const difficulty: Record<LevelId, 1 | 2 | 3> = {
    SD_1_2: 1,
    SD_3_4: 2,
    SD_5_6: 2,
    SMP_7_8: 3,
    SMP_8_9: 3,
  };

  const banks: Record<LevelId, Array<Omit<Question, "id" | "difficulty">>> = {
    SD_1_2: [
      mock(
        "pattern",
        "Jika lingkaran = 1, segitiga = 2, persegi = 3. Maka lingkaran + segitiga = ?",
        ["1", "2", "3", "4"],
        2,
      ),
      mock(
        "number",
        "Andi punya 3 kelereng, diberi 2 lagi. Berapa kelereng Andi sekarang?",
        ["3", "4", "5", "6"],
        2,
      ),
      mock(
        "pattern",
        "Bentuk mana yang berbeda? Merah, merah, biru, merah",
        ["Pertama", "Kedua", "Ketiga", "Keempat"],
        2,
      ),
      mock("number", "Jika 2 + 2 = 4, maka 3 + 3 = ?", ["4", "5", "6", "7"], 2),
      mock(
        "pattern",
        "Pola: bintang, bintang, bulan, bintang, bintang, ...",
        ["Bintang", "Bulan", "Matahari", "Awan"],
        1,
      ),
      mock(
        "logic",
        "Budi lebih tinggi dari Ani. Siapa yang paling tinggi?",
        ["Ani", "Budi", "Sama tinggi", "Tidak bisa ditentukan"],
        1,
      ),
      mock(
        "number",
        "1, 2, 3, 4, ... angka berikutnya?",
        ["3", "4", "5", "6"],
        2,
      ),
      mock("spatial", "Berapa sisi pada segitiga?", ["2", "3", "4", "5"], 1),
      mock(
        "logic",
        "Kucing adalah hewan. Hewan butuh makan. Jadi kucing butuh ...",
        ["Tidur", "Makan", "Main", "Lari"],
        1,
      ),
      mock("number", "5 - 2 = ?", ["1", "2", "3", "4"], 2),
      mock(
        "spatial",
        "Bentuk yang sama dengan kotak adalah ...",
        ["Lingkaran", "Segitiga", "Persegi", "Bintang"],
        2,
      ),
      mock("pattern", "Jika A = 1, B = 2, maka C = ?", ["1", "2", "3", "4"], 2),
      mock(
        "logic",
        "Apel, jeruk, mangga. Mana yang bukan buah?",
        ["Apel", "Jeruk", "Mangga", "Semua buah"],
        3,
      ),
      mock("number", "10 - 5 = ?", ["3", "4", "5", "6"], 2),
      mock(
        "pattern",
        "Pola: biru, merah, biru, merah, ...",
        ["Biru", "Merah", "Kuning", "Hijau"],
        0,
      ),
      mock(
        "number",
        "Siti punya 4 permen, dimakan 1. Sisanya?",
        ["1", "2", "3", "4"],
        2,
      ),
      mock("spatial", "Lingkaran punya berapa sudut?", ["0", "1", "2", "3"], 0),
      mock(
        "logic",
        "Jika hari ini Senin, besok hari ...",
        ["Minggu", "Senin", "Selasa", "Rabu"],
        2,
      ),
      mock("number", "2 x 2 = ?", ["2", "3", "4", "5"], 2),
      mock("number", "Mana yang terbesar? 3, 5, 2, 4", ["2", "3", "4", "5"], 3),
    ],
    SD_3_4: [
      mock(
        "number",
        "Jika 3 x 4 = 12, maka 4 x 3 = ?",
        ["7", "10", "12", "16"],
        2,
      ),
      mock(
        "pattern",
        "2, 4, 6, 8, ... angka berikutnya?",
        ["9", "10", "11", "12"],
        1,
      ),
      mock(
        "logic",
        "Jika A > B dan B > C, maka ...",
        ["C > A", "A > C", "A = C", "Tidak bisa ditentukan"],
        1,
      ),
      mock(
        "spatial",
        "Berapa persegi kecil dalam kotak 2 x 3?",
        ["6", "9", "12", "18"],
        0,
      ),
      mock("number", "15 - 7 + 3 = ?", ["9", "10", "11", "12"], 2),
      mock(
        "logic",
        "Kucing : hewan = mawar : ...",
        ["Tumbuhan", "Bunga", "Merah", "Harum"],
        1,
      ),
      mock("pattern", "1, 1, 2, 3, 5, 8, ...", ["11", "12", "13", "14"], 2),
      mock(
        "logic",
        "Jika semua kucing punya ekor dan Luna kucing, maka ...",
        [
          "Luna tidak punya ekor",
          "Luna punya ekor",
          "Tidak pasti",
          "Luna bukan kucing",
        ],
        1,
      ),
      mock(
        "spatial",
        "Kotak diputar 90 derajat. Bentuknya ...",
        ["Lingkaran", "Tetap kotak", "Segitiga", "Hilang"],
        1,
      ),
      mock("number", "24 dibagi 6 = ?", ["3", "4", "5", "6"], 1),
      mock("pattern", "AB, CD, EF, ...", ["GH", "FG", "EG", "HI"], 0),
      mock(
        "logic",
        "Budi lebih muda dari Ani tapi lebih tua dari Cici. Siapa tertua?",
        ["Budi", "Ani", "Cici", "Tidak tahu"],
        1,
      ),
      mock("number", "7 x 8 = ?", ["54", "56", "58", "60"], 1),
      mock(
        "spatial",
        "Kata MOM jika dicermin tetap menjadi ...",
        ["WOW", "MOM", "DAD", "POP"],
        1,
      ),
      mock("pattern", "5, 10, 20, 40, ...", ["60", "70", "80", "90"], 2),
      mock(
        "number",
        "Andi punya 3x lebih banyak dari Budi. Budi punya 4. Andi punya ...",
        ["7", "10", "12", "16"],
        2,
      ),
      mock(
        "logic",
        "Semua burung bisa terbang. Penguin burung tapi tidak terbang. Maka premis awal ...",
        ["Benar selalu", "Salah", "Tidak perlu", "Tidak pasti"],
        1,
      ),
      mock(
        "spatial",
        "Segitiga punya berapa sisi dan sudut?",
        ["2 dan 2", "3 dan 3", "4 dan 4", "3 dan 4"],
        1,
      ),
      mock("number", "100 - 37 = ?", ["53", "63", "73", "83"], 1),
      mock("pattern", "Z, Y, X, W, ...", ["U", "V", "T", "S"], 1),
    ],
    SD_5_6: [],
    SMP_7_8: [],
    SMP_8_9: [],
  };

  banks.SD_5_6 = upgradeQuestions(banks.SD_3_4, [
    mock("number", "Akar dari 144 adalah ...", ["10", "11", "12", "13"], 2),
    mock("pattern", "1, 4, 9, 16, 25, ...", ["30", "32", "34", "36"], 3),
    mock(
      "logic",
      "Air : haus = makanan : ...",
      ["Lapar", "Kenyang", "Enak", "Sehat"],
      0,
    ),
    mock("spatial", "Kubus punya berapa rusuk?", ["6", "8", "10", "12"], 3),
  ]);
  banks.SMP_7_8 = upgradeQuestions(banks.SD_5_6, [
    mock(
      "number",
      "Jika f(x)=2x+3, maka f(5)=...",
      ["10", "11", "12", "13"],
      3,
    ),
    mock(
      "logic",
      "Semua X adalah Y. Tidak ada Y yang Z. Kesimpulan?",
      [
        "Semua X adalah Z",
        "Tidak ada X yang Z",
        "Beberapa X adalah Z",
        "Tidak bisa disimpulkan",
      ],
      1,
    ),
    mock("pattern", "1, 3, 7, 15, 31, ...", ["47", "55", "63", "71"], 2),
    mock(
      "spatial",
      "Luas permukaan kubus rusuk 3 cm adalah ...",
      ["27", "36", "54", "81"],
      2,
    ),
  ]);
  banks.SMP_8_9 = upgradeQuestions(banks.SMP_7_8, [
    mock("number", "Jika 3x - 5 = 16, maka x = ...", ["5", "6", "7", "8"], 2),
    mock(
      "logic",
      "Negasi dari 'Semua murid rajin' adalah ...",
      [
        "Semua tidak rajin",
        "Ada murid yang tidak rajin",
        "Tidak ada murid rajin",
        "Beberapa rajin",
      ],
      1,
    ),
    mock("pattern", "1, 2, 6, 24, 120, ...", ["240", "360", "600", "720"], 3),
    mock(
      "spatial",
      "Diagonal ruang kubus sisi s adalah ...",
      ["s√2", "s√3", "2s", "3s"],
      1,
    ),
  ]);

  return banks[levelId].slice(0, 20).map((question, index) => ({
    ...question,
    id: index + 1,
    difficulty: difficulty[levelId],
  }));
}

function mock(
  type: QuestionType,
  question: string,
  options: string[],
  correctAnswer: number,
) {
  return { type, question, options, correctAnswer };
}

function upgradeQuestions(
  base: Array<Omit<Question, "id" | "difficulty">>,
  replacements: Array<Omit<Question, "id" | "difficulty">>,
) {
  const next = [...base];
  replacements.forEach((replacement, index) => {
    next[index * 5] = replacement;
  });
  return next;
}

function getTitleByScore(score: number) {
  if (score >= 95) return "Master Logika";
  if (score >= 90) return "Jenius Otak";
  if (score >= 85) return "Pemikir Cemerlang";
  if (score >= 80) return "Ahli Nalar";
  if (score >= 75) return "Penjelajah Pintar";
  if (score >= 70) return "Detektif Muda";
  if (score >= 65) return "Pecinta Logika";
  if (score >= 60) return "Pemikir Tangguh";
  if (score >= 50) return "Pelajar Gigih";
  return "Petarung Logika";
}

function getCaptionByScore(score: number) {
  if (score >= 95) return "Luar Biasa!";
  if (score >= 90) return "Sempurna!";
  if (score >= 85) return "Terus Berlatih!";
  if (score >= 80) return "Bagus Sekali!";
  if (score >= 75) return "Hebat!";
  if (score >= 70) return "Terus Tingkatkan!";
  if (score >= 65) return "Kamu Bisa!";
  if (score >= 60) return "Semangat!";
  if (score >= 50) return "Jangan Menyerah!";
  return "Tetap Berjuang!";
}



function LightBackground({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute -left-28 -top-28 h-72 w-72 rounded-full bg-sky-200 blur-3xl ${subtle ? "opacity-35" : "opacity-60"}`}
      />
      <div
        className={`absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-emerald-200 blur-3xl ${subtle ? "opacity-35" : "opacity-60"}`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-100 blur-3xl ${subtle ? "opacity-20" : "opacity-40"}`}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(14, 116, 144, 0.16) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50/80 p-4">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className="text-xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function typeLabel(type: QuestionType) {
  const labels: Record<QuestionType, string> = {
    pattern: "Pola",
    number: "Angka",
    logic: "Logika",
    spatial: "Ruang",
  };
  return labels[type];
}

function plainTypeLabel(type: QuestionType) {
  return typeLabel(type);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default TestLogikaPage;
