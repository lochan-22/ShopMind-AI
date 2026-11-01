import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) => (
  <Reveal
    className={cn(
      "flex flex-col gap-5",
      align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      className,
    )}
  >
    <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4 flex items-center gap-2", tone === "dark" ? "text-white/55" : "text-muted", align === "center" && "justify-center")}>
          <span className={cn("h-px w-6", tone === "dark" ? "bg-white/30" : "bg-line-strong")} />
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[2.6rem]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-[15px] leading-relaxed sm:text-base", tone === "dark" ? "text-white/60" : "text-muted")}>
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </Reveal>
);

/** Serif italic accent used inside headlines. */
export const Accent = ({ children, aurora = false }: { children: ReactNode; aurora?: boolean }) => (
  <span className={cn("font-display font-normal italic tracking-[-0.01em]", aurora && "text-aurora pr-1")}>{children}</span>
);
