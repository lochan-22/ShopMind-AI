import { forwardRef, type ButtonHTMLAttributes } from "react";

import type { VoiceButtonState } from "@/components/agent/types";
import { ListeningAnimation } from "@/components/agent/ListeningAnimation";
import { Loader } from "@/components/ui/Loader";
import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "agent-voice-btn-sm",
  md: "agent-voice-btn-md",
  lg: "agent-voice-btn-lg",
};

const stateLabels: Record<VoiceButtonState, string> = {
  idle: "Start voice input",
  listening: "Stop listening",
  processing: "Processing voice input",
};

export interface VoiceButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  state?: VoiceButtonState;
  size?: Exclude<ComponentSize, "xs" | "xl">;
}

export const VoiceButton = forwardRef<HTMLButtonElement, VoiceButtonProps>(
  (
    {
      state = "idle",
      size = "md",
      className,
      disabled,
      type = "button",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isListening = state === "listening";
    const isProcessing = state === "processing";
    const isDisabled = disabled || isProcessing;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-label={ariaLabel ?? stateLabels[state]}
        aria-pressed={isListening || undefined}
        aria-busy={isProcessing || undefined}
        className={cn(
          "agent-voice-btn",
          sizeClasses[size],
          isListening && "agent-voice-btn-listening",
          isProcessing && "agent-voice-btn-processing",
          className,
        )}
        {...props}
      >
        {isProcessing ? (
          <Loader size="sm" className="text-current" label="Processing" />
        ) : isListening ? (
          <ListeningAnimation size="sm" label="Listening" />
        ) : (
          <MicIcon />
        )}
      </button>
    );
  },
);

VoiceButton.displayName = "VoiceButton";

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
