import { MessageCircle, X } from "lucide-react";
import { useAgent } from "../context/AgentContext";

export const FloatingAgentButton = () => {
  const { closeAgent, isOpen, openAgent } = useAgent();
  return (
    <button
      type="button"
      onClick={isOpen ? closeAgent : openAgent}
      aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      className="fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none sm:bottom-6 sm:right-6"
      style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        boxShadow: "0 8px 24px rgba(124, 58, 237, 0.45)",
      }}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <div className="relative flex items-center justify-center">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-purple-600 animate-pulse" />
        </div>
      )}
      {!isOpen && (
        <span className="absolute -inset-1 -z-10 rounded-2xl bg-purple-500/30 blur-md animate-pulse" />
      )}
    </button>
  );
};
