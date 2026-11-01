import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Mic, Search, Square } from "lucide-react";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import { cn } from "../../utils/cn";

export const EXAMPLE_PROMPTS = [
  "A phone with a great camera and long battery under ₹40,000",
  "Gaming laptop with a dedicated RTX GPU under ₹80,000",
  "Noise-cancelling headphones for travel under ₹10,000",
  "Lightweight laptop for programming and machine learning",
  "Running shoes for flat feet under ₹6,000",
  "A quiet air purifier for a bedroom",
];

interface SearchCommandProps {
  onSubmit: (query: string) => void;
  initialQuery?: string;
  variant?: "hero" | "compact";
  autoFocus?: boolean;
  /** Rotate example prompts as an animated placeholder. */
  animatedPlaceholder?: boolean;
  placeholder?: string;
  className?: string;
  busy?: boolean;
}

/** Hook that types example prompts into a placeholder, one character at a time. */
const useTypedPlaceholder = (enabled: boolean, prompts: string[]) => {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(prompts[0]);
      return;
    }
    let promptIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const prompt = prompts[promptIndex];
      if (!deleting) {
        charIndex += 1;
        setText(prompt.slice(0, charIndex));
        if (charIndex === prompt.length) {
          deleting = true;
          timer = window.setTimeout(tick, 2200);
          return;
        }
        timer = window.setTimeout(tick, 32 + Math.random() * 40);
      } else {
        charIndex -= 2;
        setText(prompt.slice(0, Math.max(charIndex, 0)));
        if (charIndex <= 0) {
          deleting = false;
          promptIndex = (promptIndex + 1) % prompts.length;
          timer = window.setTimeout(tick, 380);
          return;
        }
        timer = window.setTimeout(tick, 16);
      }
    };
    timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [enabled, prompts]);
  return text;
};

export const SearchCommand = ({
  onSubmit,
  initialQuery = "",
  variant = "compact",
  autoFocus = false,
  animatedPlaceholder = false,
  placeholder = "Describe what you're looking for…",
  className,
  busy = false,
}: SearchCommandProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isHero = variant === "hero";
  const typed = useTypedPlaceholder(animatedPlaceholder && !query && !focused, EXAMPLE_PROMPTS);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    onSubmit(trimmed);
  };

  const speech = useSpeechInput({
    onTranscript: setQuery,
    onFinal: submit,
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(query);
  };

  const showTyped = animatedPlaceholder && !query && !focused;

  return (
    <div className={className}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "group relative flex items-center gap-2 transition-[box-shadow,border-color,background-color] duration-500 ease-[var(--ease-out-expo)]",
          isHero
            ? "rounded-[22px] border border-white/12 bg-white/[0.97] p-2 pl-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)]"
            : "rounded-2xl border border-line bg-surface p-1.5 pl-4 shadow-[0_1px_2px_rgb(11_13_16/0.04)]",
          focused && (isHero ? "shadow-[0_0_0_4px_rgb(43_179_217/0.25),0_30px_80px_-30px_rgb(0_0_0/0.7)]" : "border-jade-300 shadow-[0_0_0_4px_rgb(18_162_124/0.12)]"),
        )}
      >
        <Search className={cn("shrink-0 text-faint transition-colors", isHero ? "h-5 w-5" : "h-4 w-4", focused && "text-jade-600")} aria-hidden="true" />
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
            aria-label="Describe what you want to buy"
            placeholder={showTyped ? "" : placeholder}
            enterKeyHint="search"
            maxLength={500}
            className={cn(
              "w-full bg-transparent text-ink outline-none placeholder:text-faint",
              isHero ? "h-12 text-[15px] sm:text-[17px]" : "h-10 text-[14.5px]",
            )}
          />
          {showTyped && (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden whitespace-nowrap text-faint",
                isHero ? "text-[15px] sm:text-[17px]" : "text-[14.5px]",
              )}
              aria-hidden="true"
            >
              <span className="truncate">{typed}</span>
              <span className="caret-blink ml-0.5 inline-block h-[1.1em] w-px bg-jade-500" />
            </span>
          )}
        </div>

        {speech.isSupported && (
          <button
            type="button"
            onClick={speech.isListening ? speech.stop : speech.start}
            aria-label={speech.isListening ? "Stop voice input" : "Search by voice"}
            aria-pressed={speech.isListening}
            className={cn(
              "relative flex shrink-0 items-center justify-center rounded-full transition-colors",
              isHero ? "h-11 w-11" : "h-9 w-9",
              speech.isListening ? "bg-jade-50 text-jade-700" : "text-muted hover:bg-sunken hover:text-ink",
            )}
          >
            {speech.isListening && <span className="pulse-ring absolute inset-0 rounded-full bg-jade-300/50" aria-hidden="true" />}
            {speech.isListening ? <Square className="relative h-3.5 w-3.5 fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
          </button>
        )}

        <button
          type="submit"
          disabled={busy}
          aria-label="Search"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium text-white transition-all duration-300 hover:shadow-[0_10px_24px_-10px_rgb(11_132_102/0.9)] disabled:opacity-60",
            isHero ? "h-12 bg-ink px-4 hover:bg-jade-700 sm:px-6" : "h-10 bg-ink px-3.5 hover:bg-jade-700 sm:px-4",
          )}
        >
          <span className={cn("hidden text-sm sm:inline", !isHero && "text-[13px]")}>{isHero ? "Find the best" : "Search"}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-focus-within:translate-x-0.5" />
        </button>
      </form>
      {speech.error && (
        <p className={cn("mt-2 text-xs", isHero ? "text-white/70" : "text-muted")} role="status">
          {speech.error}
        </p>
      )}
    </div>
  );
};
