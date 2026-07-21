import type { AgentAnimationSize } from "@/components/agent/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<AgentAnimationSize, string> = {
  sm: "agent-listening-sm",
  md: "agent-listening-md",
  lg: "agent-listening-lg",
};

export interface ListeningAnimationProps {
  size?: AgentAnimationSize;
  label?: string;
  className?: string;
}

export function ListeningAnimation({
  size = "md",
  label = "Listening",
  className,
}: ListeningAnimationProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("agent-listening", sizeClasses[size], className)}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className="agent-listening-bar"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
