export const AgentThinking = () => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <span>Thinking...</span>
    <span className="flex gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
    </span>
  </div>
);
