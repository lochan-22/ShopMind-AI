import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { AgentBubble } from "@/components/agent/AgentBubble";
import {
  PLACEHOLDER_AGENT_RESPONSE,
  PLACEHOLDER_SOURCES,
  PLACEHOLDER_THINKING_LABEL,
} from "@/components/agent/placeholder";
import { ThinkingAnimation } from "@/components/agent/ThinkingAnimation";
import type { AgentSource } from "@/components/agent/types";
import { Badge } from "@/components/ui/Badge";

export interface AgentResponseProps extends HTMLAttributes<HTMLElement> {
  content?: string;
  thinking?: boolean;
  thinkingLabel?: string;
  sources?: AgentSource[];
  showSources?: boolean;
  footer?: ReactNode;
  author?: string;
  timestamp?: string;
}

export const AgentResponse = forwardRef<HTMLElement, AgentResponseProps>(
  (
    {
      content = PLACEHOLDER_AGENT_RESPONSE,
      thinking = false,
      thinkingLabel = PLACEHOLDER_THINKING_LABEL,
      sources = PLACEHOLDER_SOURCES,
      showSources = true,
      footer,
      author,
      timestamp,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <AgentBubble
        ref={ref}
        sender="agent"
        author={author}
        timestamp={timestamp}
        className={className}
        {...props}
      >
        {thinking ? (
          <ThinkingAnimation
            size="md"
            label={thinkingLabel}
            showLabel
            className="py-1"
          />
        ) : (
          <>
            <div className="agent-response-text">
              <FormattedText text={content} />
            </div>

            {showSources && sources.length > 0 && (
              <footer className="agent-response-sources">
                <span className="agent-response-sources-label">Sources</span>
                <ul className="agent-response-sources-list">
                  {sources.map((source) => (
                    <li key={source.id}>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="agent-response-source"
                      >
                        {source.label}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </footer>
            )}

            {footer}
          </>
        )}
      </AgentBubble>
    );
  },
);

AgentResponse.displayName = "AgentResponse";

function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n");

        if (lines.every((line) => /^\d+\.\s/.test(line.trim()))) {
          return (
            <ol key={index} className="agent-response-list">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  <InlineFormatted text={line.replace(/^\d+\.\s*/, "")} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index}>
            <InlineFormatted text={paragraph} />
          </p>
        );
      })}
    </>
  );
}

function InlineFormatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}
