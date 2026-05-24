import React from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../../lib/analytics";

const AISakaButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    trackEvent("ai_saka_open", "ai_saka");
    navigate("/tanya-pr");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Tanya PR ke AI Saka"
      className="flex items-center gap-2 text-white/90 text-sm font-medium px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Blink dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
      </span>
      <em>AI</em> | Tanya PR
    </button>
  );
};

export default AISakaButton;
