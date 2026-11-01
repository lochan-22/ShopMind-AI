import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { EXAMPLE_PROMPTS, SearchCommand } from "../search/SearchCommand";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Command-palette style search, opened from the navbar or with ⌘K / Ctrl+K. */
export const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (query: string) => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" className="fade-in absolute inset-0 bg-night/55 backdrop-blur-sm" onClick={onClose} aria-label="Close search" />
      <div className="pop-in relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <p className="eyebrow text-[10px] text-muted">Ask in your own words</p>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-sunken hover:text-ink" aria-label="Close search">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <SearchCommand onSubmit={go} autoFocus placeholder="e.g. a quiet mechanical keyboard under ₹5,000" />
        </div>
        <div className="border-t border-line bg-surface/60 px-3 py-3">
          <p className="eyebrow px-2 pb-2 text-[10px] text-faint">Try asking</p>
          <ul>
            {EXAMPLE_PROMPTS.slice(0, 4).map((prompt, index) => (
              <li key={prompt} className="rise-in" style={{ ["--rise-index" as string]: index }}>
                <button
                  type="button"
                  onClick={() => go(prompt)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
};
