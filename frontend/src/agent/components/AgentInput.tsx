import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export const AgentInput = ({
  onSubmit,
  disabled,
}: {
  onSubmit: (message: string) => Promise<void>;
  disabled: boolean;
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || disabled) return;
    const submittedMessage = message;
    setMessage("");
    await onSubmit(submittedMessage);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t pt-3"
      style={{ borderColor: "#E8E2D9" }}
    >
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={disabled}
        placeholder="Ask ShopMind AI for recommendations..."
        className="min-w-0 flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-[#A89F95]"
        style={{
          borderColor: "#E8E2D9",
          color: "#0D0B1E",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#7C3AED";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(124, 58, 237, 0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#E8E2D9";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Send message"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.30)",
        }}
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};
