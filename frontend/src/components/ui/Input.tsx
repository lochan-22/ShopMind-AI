import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";

import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "h-8 px-3 text-body-sm",
  md: "h-10 px-3 text-body-sm",
  lg: "h-11 px-4 text-body",
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: Exclude<ComponentSize, "xs" | "xl">;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      hint,
      error,
      size = "md",
      leftAddon,
      rightAddon,
      className,
      wrapperClassName,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-label text-muted-strong">
            {label}
            {required && (
              <span className="ml-0.5 text-error" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div
          className={cn(
            "flex items-center overflow-hidden rounded-input border bg-surface transition-all duration-200 ease-out",
            error
              ? "border-error focus-within:shadow-[0_0_0_3px_rgb(220_38_38_/_0.2)]"
              : "border-border focus-within:border-accent focus-within:shadow-focus",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {leftAddon && (
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center border-r border-border bg-surface-subtle px-3 text-muted"
            >
              {leftAddon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full min-w-0 bg-transparent text-foreground placeholder:text-muted-subtle",
              "focus:outline-none disabled:cursor-not-allowed",
              sizeClasses[size],
              className,
            )}
            {...props}
          />

          {rightAddon && (
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center border-l border-border bg-surface-subtle px-3 text-muted"
            >
              {rightAddon}
            </span>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-caption text-muted">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-caption text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
