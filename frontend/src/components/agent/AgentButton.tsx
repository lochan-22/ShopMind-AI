import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { ThinkingAnimation } from "@/components/agent/ThinkingAnimation";
import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<ComponentSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

export interface AgentButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ComponentSize;
  loading?: boolean;
  block?: boolean;
  pill?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const AgentButton = forwardRef<HTMLButtonElement, AgentButtonProps>(
  (
    {
      size = "md",
      loading = false,
      block = false,
      pill = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "btn btn-ai",
          sizeClasses[size],
          block && "btn-block",
          pill && "btn-pill",
          className,
        )}
        {...props}
      >
        {loading ? (
          <ThinkingAnimation size="sm" label="Processing" />
        ) : (
          (leftIcon ?? <SparkleIcon />)
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

AgentButton.displayName = "AgentButton";

function SparkleIcon() {
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
      aria-hidden="true"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
