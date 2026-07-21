import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { PLACEHOLDER_AGENT_NAME, PLACEHOLDER_TIMESTAMP } from "@/components/agent/placeholder";
import type { AgentRole } from "@/components/agent/types";
import { cn } from "@/utils/cn";

export interface AgentBubbleProps extends HTMLAttributes<HTMLElement> {
  sender?: AgentRole;
  author?: string;
  timestamp?: string;
  avatar?: ReactNode;
  showAvatar?: boolean;
  children: ReactNode;
}

export const AgentBubble = forwardRef<HTMLElement, AgentBubbleProps>(
  (
    {
      sender = "agent",
      author,
      timestamp = PLACEHOLDER_TIMESTAMP,
      avatar,
      showAvatar = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isAgent = sender === "agent";
    const displayAuthor =
      author ?? (isAgent ? PLACEHOLDER_AGENT_NAME : "You");

    return (
      <article
        ref={ref}
        aria-label={`Message from ${displayAuthor}`}
        className={cn(
          "agent-bubble",
          isAgent ? "agent-bubble-agent" : "agent-bubble-user",
          className,
        )}
        {...props}
      >
        {showAvatar && isAgent && (
          <div className="agent-bubble-avatar" aria-hidden="true">
            {avatar ?? <AgentAvatar />}
          </div>
        )}

        <div className="agent-bubble-content">
          <header className="agent-bubble-header">
            <span className="agent-bubble-author">{displayAuthor}</span>
            {timestamp && (
              <time className="agent-bubble-time">{timestamp}</time>
            )}
          </header>

          <div className="agent-bubble-body">{children}</div>
        </div>
      </article>
    );
  },
);

AgentBubble.displayName = "AgentBubble";

function AgentAvatar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </svg>
  );
}
