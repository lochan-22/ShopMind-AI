import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import type { ButtonVariant, ComponentSize } from "@/components/ui/types";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/utils/cn";

const sizeClasses: Record<ComponentSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  soft: "btn-soft",
  destructive: "btn-destructive",
  link: "btn-link",
  ai: "btn-ai",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  loading?: boolean;
  block?: boolean;
  pill?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
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
          "btn",
          sizeClasses[size],
          variantClasses[variant],
          block && "btn-block",
          pill && "btn-pill",
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader size="sm" className="text-current" label="Loading" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
