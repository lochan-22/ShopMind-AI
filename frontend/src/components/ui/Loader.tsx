import type { ComponentSize, LoaderVariant } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

const dotSizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "size-1",
  md: "size-1.5",
  lg: "size-2",
};

export interface LoaderProps {
  size?: Exclude<ComponentSize, "xs" | "xl">;
  variant?: LoaderVariant;
  label?: string;
  className?: string;
}

export function Loader({
  size = "md",
  variant = "spinner",
  label = "Loading",
  className,
}: LoaderProps) {
  if (variant === "dots") {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center gap-1", className)}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "animate-pulse rounded-full bg-current opacity-70",
              dotSizeClasses[size],
            )}
            style={{ animationDelay: `${index * 150}ms` }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
