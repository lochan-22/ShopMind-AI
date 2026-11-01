import { useLocation } from "react-router-dom";
import { useAgent } from "../AgentContext";
import { LogoMark } from "../../components/brand/Logo";

/** Floating button that opens the concierge. */
export const AgentLauncher = () => {
  const { isOpen, openAgent, isThinking } = useAgent();
  const { pathname } = useLocation();
  if (isOpen || pathname === "/agent") return null;
  return (
    <button
      type="button"
      onClick={openAgent}
      className="pop-in group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-40 flex h-14 items-center gap-2.5 rounded-full bg-night pl-2 pr-2 text-white shadow-[0_20px_50px_-15px_rgb(0_0_0/0.65)] ring-1 ring-white/10 transition-[transform,padding] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:right-5 sm:pr-5"
      aria-label="Ask ShopMind"
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        {isThinking && <span className="pulse-ring absolute inset-0 rounded-full bg-iris/50" aria-hidden="true" />}
        <LogoMark className="relative h-10 w-10" />
      </span>
      <span className="hidden text-sm font-medium sm:inline">Ask ShopMind</span>
    </button>
  );
};
