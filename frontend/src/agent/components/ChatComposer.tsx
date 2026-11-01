import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { useSpeechInput } from "../../hooks/useSpeechInput";
import { cn } from "../../utils/cn";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const ChatComposer = ({ onSend, disabled = false, autoFocus = false, className }: ChatComposerProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const speech = useSpeechInput({ onTranscript: setValue, onFinal: send });

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(value);
    }
  };

  return (
    <form
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        send(value);
      }}
      className={cn(
        "flex items-end gap-2 rounded-[22px] border border-line bg-surface p-2 pl-4 shadow-[0_1px_2px_rgb(11_13_16/0.05)] transition-[border-color,box-shadow] focus-within:border-jade-300 focus-within:shadow-[0_0_0_4px_rgb(18_162_124/0.12)]",
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        maxLength={8000}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about any product, budget or use…"
        aria-label="Message ShopMind"
        className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-faint"
      />
      {speech.isSupported && (
        <button
          type="button"
          onClick={speech.isListening ? speech.stop : speech.start}
          aria-label={speech.isListening ? "Stop voice input" : "Speak your message"}
          aria-pressed={speech.isListening}
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
            speech.isListening ? "bg-jade-50 text-jade-700" : "text-muted hover:bg-sunken hover:text-ink",
          )}
        >
          {speech.isListening && <span className="pulse-ring absolute inset-0 rounded-full bg-jade-300/50" aria-hidden="true" />}
          {speech.isListening ? <Square className="relative h-3.5 w-3.5 fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
        </button>
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-[background-color,transform] hover:bg-jade-700 active:scale-90 disabled:bg-sunken disabled:text-faint"
      >
        <ArrowUp className="h-[18px] w-[18px]" />
      </button>
    </form>
  );
};
