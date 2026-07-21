import { forwardRef, type HTMLAttributes } from "react";

import type { BadgeVariant, ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-muted text-foreground border-border",
  accent: "bg-accent-muted text-accent-700 border-accent-200",
  secondary: "bg-secondary-100 text-secondary-700 border-secondary-200",
  success: "bg-success-muted text-success border-green-200",
  warning: "bg-warning-muted text-warning border-amber-200",
  error: "bg-error-muted text-error border-red-200",
  outline: "bg-transparent text-muted-strong border-border",
};

const sizeClasses: Record<Exclude<ComponentSize, "lg" | "xl">, string> = {
  xs: "px-1.5 py-0 text-overline",
  sm: "px-2 py-0.5 text-caption",
  md: "px-2.5 py-0.5 text-label",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: Exclude<ComponentSize, "lg" | "xl">;
  pill?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = "default", size = "sm", pill = true, className, ...props },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center border font-medium whitespace-nowrap",
          pill ? "rounded-pill" : "rounded-sm",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
