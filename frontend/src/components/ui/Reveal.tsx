import type { CSSProperties, ReactNode } from "react";
import { useInView } from "../../hooks/useInView";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position within a staggered group; each step adds a short delay. */
  index?: number;
  variant?: "rise" | "scale";
  style?: CSSProperties;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export const Reveal = ({ children, className, index = 0, variant = "rise", style }: RevealProps) => {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      data-reveal={variant === "scale" ? "scale" : ""}
      data-visible={visible}
      style={{ ...style, ["--reveal-index" as string]: Math.min(index, 12) }}
    >
      {children}
    </div>
  );
};
