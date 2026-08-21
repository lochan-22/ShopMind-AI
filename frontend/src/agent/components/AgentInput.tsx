import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export const AgentInput = ({ onSubmit, disabled }: { onSubmit: (message: string) => Promise<void>; disabled: boolean }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || disabled) return;
    const submittedMessage = message;
    setMessage("");
    await onSubmit(submittedMessage);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 pt-3">
      <input value={message} onChange={(event) => setMessage(event.target.value)} disabled={disabled} placeholder="Ask ShopMind AI..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50" />
      <button type="submit" disabled={disabled || !message.trim()} aria-label="Send message" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};
