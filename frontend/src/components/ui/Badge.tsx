import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type BadgeTone = "neutral" | "jade" | "gold" | "warn" | "danger" | "dark" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-ink-2",
  jade: "bg-jade-50 text-jade-700 ring-1 ring-inset ring-jade-200/70",
  gold: "bg-gold-soft text-gold ring-1 ring-inset ring-gold/20",
  warn: "bg-warn-soft text-warn ring-1 ring-inset ring-warn/15",
  danger: "bg-danger-soft text-danger ring-1 ring-inset ring-danger/15",
  dark: "bg-ink text-white",
  outline: "bg-surface/80 text-ink-2 ring-1 ring-inset ring-line backdrop-blur",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}

export const Badge = ({ children, tone = "neutral", icon, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none",
      tones[tone],
      className,
    )}
  >
    {icon}
    <span className="truncate">{children}</span>
  </span>
);
