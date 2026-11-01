import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "light" | "glass";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_8px_20px_-10px_rgb(11_13_16/0.6)] hover:bg-ink-2",
  accent: "bg-jade-600 text-white shadow-[0_8px_22px_-10px_rgb(11_132_102/0.8)] hover:bg-jade-700",
  secondary: "border border-line bg-surface text-ink shadow-[0_1px_2px_rgb(11_13_16/0.05)] hover:border-line-strong hover:bg-well",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
  light: "bg-white text-ink hover:bg-white/90 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)]",
  glass: "border border-white/15 bg-white/[0.06] text-white backdrop-blur hover:bg-white/[0.12] hover:border-white/25",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-3.5 text-[13px]",
  md: "h-11 rounded-full px-5 text-sm",
  lg: "h-13 rounded-full px-7 text-[15px]",
};

/** Class string for button-styled elements, including router links and anchors. */
export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, icon, iconRight, children, type = "button", ...rest }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  ),
);
Button.displayName = "Button";
