import type { AgentAnimationSize } from "@/components/agent/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<AgentAnimationSize, string> = {
  sm: "agent-thinking-sm",
  md: "agent-thinking-md",
  lg: "agent-thinking-lg",
};

export interface ThinkingAnimationProps {
  size?: AgentAnimationSize;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function ThinkingAnimation({
  size = "md",
  label = "Thinking",
  showLabel = false,
  className,
}: ThinkingAnimationProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "agent-thinking",
        sizeClasses[size],
        showLabel && "agent-thinking-with-label",
        className,
      )}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className="agent-thinking-dot"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
      {showLabel && (
        <span aria-hidden="true" className="agent-thinking-label">
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}
