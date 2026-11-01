import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Maximize2, RotateCcw, X } from "lucide-react";
import { useAgent } from "../AgentContext";
import { LogoMark } from "../../components/brand/Logo";
import { ChatComposer } from "./ChatComposer";
import { ChatThread } from "./ChatThread";

export const STARTER_PROMPTS = [
  "Sony headphones under ₹5,000",
  "Best smartphone under ₹30,000",
  "Laptop for college under ₹50,000",
  "What should I look for in a gaming mouse?",
];

export const ConciergeIntro = ({ onPick, compact = false }: { onPick: (prompt: string) => void; compact?: boolean }) => (
  <div className={compact ? "pt-6" : "pt-10"}>
    <LogoMark className={compact ? "h-12 w-12" : "h-14 w-14"} />
    <h2 className={compact ? "mt-5 text-xl font-semibold tracking-tight text-ink" : "mt-6 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl"}>
      What are you shopping for?
    </h2>
    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
      Mention a brand, category or budget and I'll pull live listings. Ask anything else and I'll explain what matters before you buy.
    </p>
    <div className={compact ? "mt-6 flex flex-col gap-2" : "mt-8 grid gap-2.5 sm:grid-cols-2"}>
      {STARTER_PROMPTS.map((prompt, index) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onPick(prompt)}
          className="rise-in rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[13.5px] text-ink-2 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:text-ink"
          style={{ ["--rise-index" as string]: index }}
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);

/** Slide-over concierge available on every page. */
export const AgentPanel = () => {
  const { isOpen, closeAgent, messages, isThinking, sendMessage, retryMessage, resetConversation } = useAgent();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeAgent();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    if (window.matchMedia("(max-width: 640px)").matches) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, closeAgent]);

  useEffect(() => {
    if (pathname === "/agent") closeAgent();
  }, [pathname, closeAgent]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label="ShopMind concierge">
      <button type="button" className="fade-in absolute inset-0 bg-night/30 backdrop-blur-[2px]" onClick={closeAgent} aria-label="Close concierge" />
      <aside className="slide-in-right absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-paper shadow-[0_0_80px_-20px_rgb(0_0_0/0.45)] sm:inset-y-3 sm:right-3 sm:w-[440px] sm:rounded-[28px] sm:border">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <LogoMark className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">ShopMind Concierge</p>
            <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-jade-500" /> Live listings · streaming answers
            </p>
          </div>
          {messages.length > 0 && (
            <button type="button" onClick={resetConversation} disabled={isThinking} className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink" title="New conversation" aria-label="Start a new conversation">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <Link to="/agent" className="hidden rounded-full p-2 text-muted hover:bg-sunken hover:text-ink sm:block" title="Open full screen" aria-label="Open concierge full screen">
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button type="button" onClick={closeAgent} className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink" aria-label="Close concierge">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          {messages.length === 0 ? (
            <ConciergeIntro compact onPick={(prompt) => void sendMessage(prompt)} />
          ) : (
            <ChatThread messages={messages} isThinking={isThinking} onNavigate={closeAgent} onRetry={retryMessage} className="pt-6" />
          )}
        </div>
        <div className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <ChatComposer onSend={(text) => void sendMessage(text)} disabled={isThinking} autoFocus />
          <p className="mt-2 px-2 text-center text-[10.5px] text-faint">Product facts come from live listings. Verify details with the retailer before buying.</p>
        </div>
      </aside>
    </div>,
    document.body,
  );
};
