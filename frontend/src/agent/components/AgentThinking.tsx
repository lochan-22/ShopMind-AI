export const AgentThinking = () => (
  <div
    className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold"
    style={{
      background: "#FFFFFF",
      borderColor: "#E8E2D9",
      color: "#7C3AED",
    }}
  >
    <span>Thinking...</span>
    <span className="flex gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" />
    </span>
  </div>
);
