import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { Loader } from "@/components/ui/Loader";
import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const iconSizeClasses: Record<ComponentSize, string> = {
  xs: "btn-icon-xs",
  sm: "btn-icon-sm",
  md: "btn-icon-md",
  lg: "btn-icon-lg",
  xl: "btn-icon-lg",
};

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for screen readers — describes the button action. */
  "aria-label": string;
  size?: Exclude<ComponentSize, "xl">;
  variant?: "ghost" | "outline" | "soft" | "primary" | "secondary";
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost: "btn-ghost",
  outline: "btn-outline",
  soft: "btn-soft",
  primary: "btn-primary",
  secondary: "btn-secondary",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      variant = "ghost",
      loading = false,
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
          "btn",
          iconSizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader size="sm" className="text-current" label="Loading" />
        ) : (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {children}
          </span>
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
