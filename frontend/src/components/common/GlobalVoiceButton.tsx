import React, { useState } from "react";
import { Mic } from "lucide-react";

export interface GlobalVoiceButtonProps {
  /** Optional callback for handling global voice control activation */
  onVoiceClick?: () => void;
}

/**
 * Reusable Global Bottom-Center Voice Control Button.
 *
 * Mounted in the shared application layout across all routes.
 * Positioned fixed at the bottom center of the viewport with safe-area insets.
 */
export const GlobalVoiceButton: React.FC<GlobalVoiceButtonProps> = ({ onVoiceClick }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleClick = () => {
    if (onVoiceClick) {
      onVoiceClick();
    } else {
      console.info("[ShopMind AI] Global voice control triggered. Voice recognition pipeline pending implementation.");
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2200);
    }
  };

  return (
    <aside
      aria-label="Global Voice Control"
      className="fixed z-40 pointer-events-none select-none"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))",
      }}
    >
      <div className="group relative flex items-center justify-center pointer-events-auto">
        {/* Accessible Floating Tooltip & Status Feedback */}
        <span
          role="tooltip"
          aria-hidden={!showFeedback}
          className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] whitespace-nowrap rounded-full bg-[#0D0B1E]/95 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-200 ${
            showFeedback
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
          }`}
        >
          {showFeedback ? "Voice Control (Coming Soon)" : "Voice Control"}
        </span>

        {/* Circular Purple Global Voice Control Button */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Voice Control"
          title="Voice Control"
          className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2] motion-reduce:transition-none motion-reduce:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            boxShadow:
              "0 8px 24px -4px rgba(124, 58, 237, 0.45), 0 0 16px -2px rgba(168, 85, 247, 0.25)",
          }}
        >
          {/* Restrained Ambient Purple Glow */}
          <span
            className="pointer-events-none absolute -inset-1 rounded-full bg-purple-500/20 blur-sm transition-opacity group-hover:opacity-80"
            aria-hidden="true"
          />

          {/* White Microphone Icon */}
          <Mic className="relative z-10 h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
};

export default GlobalVoiceButton;

