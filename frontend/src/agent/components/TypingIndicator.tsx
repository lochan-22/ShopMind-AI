export const TypingIndicator = () => (
  <span className="inline-flex items-center gap-1 py-1" aria-label="ShopMind is thinking">
    {[0, 1, 2].map((dot) => (
      <span key={dot} className="typing-dot h-1.5 w-1.5 rounded-full bg-jade-500" style={{ animationDelay: `${dot * 0.15}s` }} />
    ))}
  </span>
);
