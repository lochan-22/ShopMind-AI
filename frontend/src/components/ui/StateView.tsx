import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface StateViewProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "danger" | "warn";
  className?: string;
}

const toneRing = {
  neutral: "bg-surface text-ink-2 ring-line",
  danger: "bg-danger-soft text-danger ring-danger/15",
  warn: "bg-warn-soft text-warn ring-warn/15",
};

/** Shared layout for empty, error and notice states. */
export const StateView = ({ icon, title, description, actions, tone = "neutral", className }: StateViewProps) => (
  <div
    className={cn(
      "rise-in flex flex-col items-center rounded-3xl border border-line bg-surface/70 px-6 py-16 text-center sm:py-20",
      className,
    )}
    role={tone === "danger" ? "alert" : undefined}
  >
    <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset", toneRing[tone])}>
      {icon}
    </div>
    <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink sm:text-xl">{title}</h2>
    {description && <div className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</div>}
    {actions && <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
  </div>
);
