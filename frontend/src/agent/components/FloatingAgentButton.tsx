import { MessageCircle, X } from "lucide-react";
import { useAgent } from "../context/AgentContext";

export const FloatingAgentButton = () => {
  const { closeAgent, isOpen, openAgent } = useAgent();
  return <button type="button" onClick={isOpen ? closeAgent : openAgent} aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"} className="fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:bottom-6 sm:right-6">{isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}{!isOpen && <span className="absolute -inset-1 -z-10 rounded-2xl bg-indigo-400/30 blur-md" />}</button>;
};
